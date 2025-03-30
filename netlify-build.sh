#!/bin/bash
# Netlify build script to prepare API endpoints as Netlify Functions

echo "Starting Netlify Functions build process..."

# Create netlify/functions directory if it doesn't exist
mkdir -p netlify/functions

# Bundle the shared API utilities
echo "Bundling shared API utilities..."
mkdir -p netlify/functions/_shared

# Copy the storage adapter to Netlify Functions
cp api/_storage.js netlify/functions/_shared/
cp api/_error-handler.js netlify/functions/_shared/
cp api/netlify-adapter.js netlify/functions/_shared/

# Create a helper to generate Netlify function wrapper for each API
function create_netlify_function() {
  local api_path=$1
  local function_name=$(basename $api_path .js)
  local target_dir="netlify/functions/$function_name"
  
  # Create directory for the function
  mkdir -p $target_dir
  
  # Create the function entry point
  cat > $target_dir/index.js << EOF
// Netlify Function wrapper for $function_name API
const originalHandler = require('../../api/$function_name.js').default;
const { createServerlessAdapter } = require('@netlify/functions');

// Convert Express-style handler to Netlify Function
exports.handler = createServerlessAdapter(originalHandler);
EOF
  
  echo "Created Netlify function: $function_name"
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
        local_path=${nested_file#api/}
        function_name=$(echo $local_path | tr '/' '-' | sed 's/.js$//')
        
        # Create a flattened function name for Netlify
        target_dir="netlify/functions/$function_name"
        mkdir -p $target_dir
        
        # Create the function entry point with path mapping
        cat > $target_dir/index.js << EOF
// Netlify Function wrapper for nested API: $local_path
const originalHandler = require('../../$nested_file').default;
const { createServerlessAdapter } = require('@netlify/functions');

// Handle path parameters by mapping them from Netlify's event.path
const pathParamHandler = (req, res, next) => {
  // Extract path parameters from the URL
  const pathSegments = req.path.split('/').filter(segment => segment);
  const originalPathSegments = '$local_path'.split('/').filter(segment => segment);
  
  // Map path parameters based on convention [paramName]
  originalPathSegments.forEach((segment, index) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const paramName = segment.substring(1, segment.length - 1);
      if (pathSegments[index]) {
        req.params[paramName] = pathSegments[index];
      }
    }
  });
  
  next();
};

// Convert Express-style handler to Netlify Function with path param handling
exports.handler = createServerlessAdapter(originalHandler, {
  middleware: [pathParamHandler]
});
EOF
        
        echo "Created Netlify function for nested API: $function_name"
      fi
    done
  fi
done

echo "Netlify Functions build process complete."