#!/bin/bash
# Render startup script

# Ensure PORT environment variable is set (Render provides this)
if [ -z "$PORT" ]; then
  export PORT=10000
  echo "Warning: PORT environment variable not provided, defaulting to $PORT"
fi

# Set platform identification
export DEPLOYMENT_PLATFORM=render

# Log platform and environment information
echo "Starting LifeOS application..."
echo "Platform: $DEPLOYMENT_PLATFORM"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Check which path exists - handle both old and new build output formats
if [ -f "dist/server/index.js" ]; then
  echo "Using dist/server/index.js"
  exec node dist/server/index.js
elif [ -f "dist/index.js" ]; then
  echo "Using dist/index.js"
  exec node dist/index.js
else
  echo "ERROR: Could not find server entry point!"
  echo "Contents of dist directory:"
  ls -la dist
  exit 1
fi