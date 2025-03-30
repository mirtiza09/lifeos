#!/bin/bash
# Netlify build script to prepare API endpoints as Netlify Functions
# Completely rewritten to fix path issues and ensure correct imports

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
  path: "/api/$function_name"
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
  function_name=$(echo $local_path | tr '/' '-' | sed 's/.js$//')
  nested_dir=$(dirname "$local_path")
  
  # Parse the path to identify parameters
  api_path="/api/$local_path"
  # Replace [param] with :param for routing
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
  path: "$route_path"
};
EOF
  
  # Explicitly copy the original handler file to ensure it's available
  cp "$nested_file" "netlify/api/$local_path" || echo "Warning: Failed to copy $nested_file"
  
  echo "Created modern Netlify function for nested API: $function_name with path: $route_path"
}

# Process all API endpoints except utility files and netlify-adapter.js
for api_file in api/*.js; do
  # Skip utility files (prefixed with _) and netlify-adapter.js
  if [[ $api_file != *"_"* && $api_file != *"netlify-adapter.js" ]]; then
    create_netlify_function $api_file
  fi
done

# Process nested API endpoints (like habits/[id]/complete.js)
for dir in api/*; do
  if [ -d "$dir" ]; then
    for nested_file in $dir/*.js; do
      if [ -f "$nested_file" ]; then
        create_nested_netlify_function $nested_file
      fi
    done
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
  path: "/api/*"
};
EOF

echo "Created API catch-all function"

# Debug: List files to verify they're in the correct locations
echo "Verifying API files:"
find netlify/api -type f | sort

echo "Verifying function files:"
find netlify/functions -type f | sort

echo "Netlify Functions build process complete."