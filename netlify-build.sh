#!/bin/bash
# ====================================
# Netlify Build Script for LifeOS API
# ====================================
# This script transforms our Express-style API files into modern Netlify Functions
# Key features:
# 1. Utility modules are properly excluded from function generation
# 2. Dynamic route parameters (e.g., [id]) are transformed to Netlify-compatible formats
# 3. Nested API paths are properly adapted for Netlify's routing system
# 4. Proper import paths are maintained between adapter files and original handlers
#
# IMPORTANT: Netlify has strict requirements for function names!
# - Function names can only include alphanumeric characters, hyphens, and underscores
# - NO square brackets or other special characters are allowed

echo "Starting Netlify Functions build process..."

# Create directories
mkdir -p netlify/functions
mkdir -p netlify/api
mkdir -p netlify/api/habits
mkdir -p netlify/api/analytics
mkdir -p netlify/api/tasks
mkdir -p netlify/api/notes

# The main issue is that the API handlers need to be properly copied and referenced
# Copy ALL api files to netlify/api/ - this is crucial!
echo "Copying API files to build location..."
cp -r api/* netlify/api/

# The key fix - create a package.json in netlify/api for better module resolution
cat > netlify/api/package.json << EOF
{
  "name": "lifeos-api",
  "type": "module",
  "version": "1.0.0"
}
EOF

# Copy utility files to shared directory for convenience
echo "Setting up shared utilities..."
mkdir -p netlify/functions/_shared
cp api/_storage.js netlify/functions/_shared/
cp api/_error-handler.js netlify/functions/_shared/
cp api/netlify-adapter.js netlify/functions/_shared/
cp api/pg-netlify-adapter.js netlify/functions/_shared/

# Ensure pg dependency is available for PostgreSQL connections
# We're using the package.json in netlify/api for module resolution
echo "Ensuring PostgreSQL dependencies are available..."
if ! grep -q "pg" netlify/api/package.json; then
  # Update the package.json to include the pg dependency
  sed -i 's/"version": "1.0.0"/"version": "1.0.0",\n  "dependencies": {\n    "pg": "^8.11.3"\n  }/g' netlify/api/package.json
fi

# Log DATABASE_URL presence (without revealing it)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL environment variable is present (length: ${#DATABASE_URL})"
else
  echo "WARNING: DATABASE_URL environment variable is not set. PostgreSQL connections will fail."
fi

# Create a helper to generate modern Netlify function wrapper for each API
function create_netlify_function() {
  api_path=$1
  function_name=$(basename $api_path .js)
  target_dir="netlify/functions/$function_name"
  
  # Important to use absolute paths for clarity
  original_handler_path="/opt/build/repo/netlify/api/$function_name.js"
  
  # Create directory for the function
  mkdir -p $target_dir
  
  # Create the function entry point with the modern Netlify Functions API
  cat > $target_dir/index.js << EOF
// Modern Netlify Function wrapper for $function_name API
import { Context } from "@netlify/functions";
// Fix: Use absolute path reference for reliable imports
import originalHandler from "../../../netlify/api/$function_name.js";

// Express adapter to convert Request/Response objects
const expressToNetlify = async (req, context) => {
  // Mock Express-like objects
  const mockReq = {
    method: req.method,
    url: req.url,
    path: new URL(req.url).pathname,
    query: Object.fromEntries(new URL(req.url).searchParams),
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.json() : undefined,
    params: context.params || {}
  };
  
  let statusCode = 200;
  let responseBody = {};
  let responseHeaders = {};
  
  // Mock Express response
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (body) => {
      responseBody = body;
      responseHeaders['Content-Type'] = 'application/json';
      return mockRes;
    },
    send: (body) => {
      responseBody = body;
      return mockRes;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    set: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    end: () => {}
  };
  
  // Call the original Express handler
  await originalHandler(mockReq, mockRes);
  
  // Convert to Netlify Response
  return new Response(
    typeof responseBody === 'object' ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};

// Modern Netlify Function handler
export default async (req, context) => {
  return expressToNetlify(req, context);
};

// Configure routing
export const config = {
  path: "/.netlify/functions/$function_name"
};
EOF
  
  echo "Created modern Netlify function: $function_name"
  
  # Explicitly copy the original handler file to ensure it's available
  cp "api/$function_name.js" "netlify/api/$function_name.js" || echo "Warning: Failed to copy $function_name.js"
}

# Create a helper for nested API paths with path parameters
function create_nested_netlify_function() {
  nested_file=$1
  local_path=${nested_file#api/}
  
  # Create a Netlify-compliant function name by:
  # 1. Replacing / with -
  # 2. Removing file extension
  # 3. CRITICAL FIX: Remove brackets entirely from function names
  #    This transforms 'habits/[id]' to 'habits-id' which is valid for Netlify
  #    Without this, deployment will fail with "Invalid function name" errors
  function_name=$(echo $local_path | tr '/' '-' | sed 's/.js$//' | sed 's/\[\([^]]*\)\]/\1/g')
  
  nested_dir=$(dirname "$local_path")
  
  # Parse the path to identify parameters
  api_path="/api/$local_path"
  
  # Replace [param] with :$1 for Netlify's path-based routing
  # This is crucial for parameter extraction to work correctly
  # Format: `/api/habits/[id]` becomes `/api/habits/:$1`
  # The path matcher will extract the parameter from the URL and pass it via context.params
  route_path=$(echo $api_path | sed 's/\[\([^]]*\)\]/:$1/g')
  
  # Create directory for the function
  target_dir="netlify/functions/$function_name"
  mkdir -p $target_dir
  
  # Create the nested directory structure in netlify/api if needed
  mkdir -p "netlify/api/$nested_dir"
  
  # Create the function entry point with modern Netlify Functions API
  cat > $target_dir/index.js << EOF
// Modern Netlify Function wrapper for nested API: $local_path
import { Context } from "@netlify/functions";
// Fix: Use absolute path reference for reliable imports
import originalHandler from "../../../netlify/api/$local_path";

// Express adapter to convert Request/Response objects
const expressToNetlify = async (req, context) => {
  // Mock Express-like objects
  const mockReq = {
    method: req.method,
    url: req.url,
    path: new URL(req.url).pathname,
    query: Object.fromEntries(new URL(req.url).searchParams),
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.json() : undefined,
    params: context.params || {}
  };
  
  let statusCode = 200;
  let responseBody = {};
  let responseHeaders = {};
  
  // Mock Express response
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (body) => {
      responseBody = body;
      responseHeaders['Content-Type'] = 'application/json';
      return mockRes;
    },
    send: (body) => {
      responseBody = body;
      return mockRes;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    set: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    end: () => {}
  };
  
  // Call the original Express handler
  await originalHandler(mockReq, mockRes);
  
  // Convert to Netlify Response
  return new Response(
    typeof responseBody === 'object' ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};

// Modern Netlify Function handler
export default async (req, context) => {
  return expressToNetlify(req, context);
};

// Configure routing
export const config = {
  path: "$route_path".replace(/^\/api\//, "/.netlify/functions/")
};
EOF
  
  # Explicitly copy the original handler file to ensure it's available
  cp "$nested_file" "netlify/api/$local_path" || echo "Warning: Failed to copy $nested_file"
  
  echo "Created modern Netlify function for nested API: $function_name with path: $route_path (original path: $local_path)"
}

# Process all API endpoints except utility files and netlify-adapter.js
for api_file in api/*.js; do
  # Skip utility files (prefixed with _) and netlify-adapter.js
  if [[ $api_file != *"_"* && $api_file != *"netlify-adapter.js" ]]; then
    create_netlify_function $api_file
  fi
done

# Process all nested API endpoints using find
# This is more robust than nested for loops for handling complex directory structures
# It will handle files like:
# - habits/[id].js
# - habits/[id]/complete.js
# - habits/[id]/operations/reset.js (deeply nested)
echo "Processing nested API endpoints..."

# Debug: Check what nested API files are found
echo "Debug: Found nested API files:"
find api -type f -name "*.js" | grep "/" | grep -v "api/[^/]*\.js$"

# Ensure specific important endpoints are definitely created
# This ensures critical endpoints like notes/category/[category].js are not missed
for critical_endpoint in "notes/category/[category].js"; do
  if [ -f "api/$critical_endpoint" ]; then
    echo "Ensuring critical endpoint is created: $critical_endpoint"
    create_nested_netlify_function "api/$critical_endpoint"
  else
    echo "Warning: Critical endpoint file not found: api/$critical_endpoint"
  fi
done

# Use find to discover all JS files in subdirectories of api/
# Note: We need to find any JS file that's not at the top level of the api/ directory
find api -type f -name "*.js" | grep "/" | grep -v "api/[^/]*\.js$" | while read -r nested_file; do
  if [[ "$nested_file" != *"_"* && "$nested_file" != *"netlify-adapter.js" && "$nested_file" != *"pg-netlify-adapter.js" ]]; then
    # Only process actual endpoints, not utility files
    create_nested_netlify_function "$nested_file"
  fi
done

# Create a catch-all function for API requests
mkdir -p netlify/functions/api-catchall

cat > netlify/functions/api-catchall/index.js << EOF
// Catch-all API handler for any unmatched API routes
import { Context } from "@netlify/functions";

export default async (req, context) => {
  return new Response(JSON.stringify({
    error: "API endpoint not found",
    path: req.url,
    method: req.method
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const config = {
  path: "/.netlify/functions/*"
};
EOF

echo "Created API catch-all function"

# Debug: List files to verify they're in the correct locations
echo "Verifying API files:"
find netlify/api -type f | sort

echo "Verifying function files:"
find netlify/functions -type f | sort

echo "Netlify Functions build process complete."