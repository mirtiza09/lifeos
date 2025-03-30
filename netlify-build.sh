#!/bin/bash
# Netlify build script to prepare API endpoints as Netlify Functions
# Updated to use the new modern Netlify Functions API

echo "Starting Netlify Functions build process..."

# Create netlify/functions directory if it doesn't exist
mkdir -p netlify/functions

# Bundle the shared API utilities
echo "Bundling shared API utilities..."
mkdir -p netlify/functions/_shared

# Copy the storage adapter to Netlify Functions
# Use relative paths for better compatibility during builds
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cp "$SCRIPT_DIR/api/_storage.js" netlify/functions/_shared/ || echo "Warning: Could not copy _storage.js"
cp "$SCRIPT_DIR/api/_error-handler.js" netlify/functions/_shared/ || echo "Warning: Could not copy _error-handler.js"
cp "$SCRIPT_DIR/api/netlify-adapter.js" netlify/functions/_shared/ || echo "Warning: Could not copy netlify-adapter.js"

# Create a helper to generate modern Netlify function wrapper for each API
function create_netlify_function() {
  api_path=$1
  function_name=$(basename $api_path .js)
  target_dir="netlify/functions/$function_name"
  
  # Create directory for the function
  mkdir -p $target_dir
  
  # Create the function entry point with the modern Netlify Functions API
  cat > $target_dir/index.js << EOF
// Modern Netlify Function wrapper for $function_name API
import { Context } from "@netlify/functions";
import originalHandler from "../../api/$function_name.js";

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
}

# Create a helper for nested API paths with path parameters
function create_nested_netlify_function() {
  nested_file=$1
  local_path=${nested_file#api/}
  function_name=$(echo $local_path | tr '/' '-' | sed 's/.js$//')
  
  # Parse the path to identify parameters
  api_path="/api/$local_path"
  # Replace [param] with :param for routing
  route_path=$(echo $api_path | sed 's/\[\([^]]*\)\]/:$1/g')
  
  # Create directory for the function
  target_dir="netlify/functions/$function_name"
  mkdir -p $target_dir
  
  # Create the function entry point with modern Netlify Functions API
  cat > $target_dir/index.js << EOF
// Modern Netlify Function wrapper for nested API: $local_path
import { Context } from "@netlify/functions";
import originalHandler from "../../$nested_file";

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
  
  echo "Created modern Netlify function for nested API: $function_name with path: $route_path"
}

# Process all API endpoints except utility files
for api_file in api/*.js; do
  if [[ $api_file != *"_"* ]]; then
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

echo "Netlify Functions build process complete."