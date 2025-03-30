#!/bin/bash
# Vercel build script

echo "Starting Vercel build process..."

# Create a Vercel output directory
mkdir -p .vercel/output
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions

# Build the frontend using Vite
echo "Building frontend with Vite..."
npm run build

# Copy static assets to the Vercel output directory
echo "Copying static assets to Vercel output directory..."
cp -r dist/* .vercel/output/static/

# Include the config file
cat > .vercel/output/config.json << EOF
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
EOF

echo "Vercel build process completed successfully."