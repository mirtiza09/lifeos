#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting Render build process..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the frontend and server
echo "Building the application..."
npm run build

# Ensure we have a complete build
echo "Verifying build output..."
if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not created during build"
  exit 1
fi

# Log the build output structure
echo "Build output structure:"
find dist -type f | sort

# Run database migrations if necessary
if [ -n "$DATABASE_URL" ]; then
  echo "Database URL detected, running migrations..."
  npm run db:push
else
  echo "No DATABASE_URL found, skipping migrations."
fi

# Copy files for Render deployment
echo "Preparing files for Render deployment..."

# Ensure render adapter is included
mkdir -p dist/client/public
cp client/public/render-adapter.js dist/client/public/

# Create a production version of the server
echo "Creating production server..."
mkdir -p dist/server
cp -r server/* dist/server/

# Copy shared files
mkdir -p dist/shared
cp -r shared/* dist/shared/

# Ensure package.json is in the dist folder
cp package.json dist/

# Set deployment platform environment variable for Render
echo "Setting platform environment variables..."
export DEPLOYMENT_PLATFORM=render

# Make sure the startup script exists and is executable
if [ ! -f "render-start.sh" ]; then
  echo "Creating Render startup script..."
  cat > render-start.sh << EOL
#!/bin/bash
# This script ensures the application starts correctly on Render

# Ensure PORT environment variable is set (Render provides this)
if [ -z "\$PORT" ]; then
  export PORT=10000
  echo "Warning: PORT environment variable not provided, defaulting to \$PORT"
fi

# Set platform identification
export DEPLOYMENT_PLATFORM=render

# Start the application
echo "Starting LifeOS application on port \$PORT..."
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
EOL
fi

# Make sure the startup script is executable
chmod +x render-start.sh

echo "Build process completed successfully!"