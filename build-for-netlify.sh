#!/bin/bash
# Script to run the regular build and then prepare for Netlify deployment
# This script is referenced in netlify.toml and is executed during Netlify's build process

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting LifeOS build for Netlify deployment..."

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL environment variable is not set"
  echo "   This is required for database connectivity in production"
  echo "   Make sure to set this in your Netlify environment variables"
fi

# Ensure node version is compatible
NODE_VERSION=$(node -v)
echo "🔍 Using Node.js version: $NODE_VERSION"

# Run the standard build
echo "🏗️  Building application..."
npm run build

# Execute the Netlify-specific build script to prepare API endpoints as functions
echo "🔧 Preparing Netlify Functions..."
bash netlify-build.sh

# Verify the build output
if [ ! -d "dist/public" ]; then
  echo "❌ Build failed: dist/public directory not found"
  exit 1
fi

if [ ! -d "netlify/functions" ]; then
  echo "❌ Build failed: netlify/functions directory not found"
  exit 1
fi

# Copy the netlify adapter to the public directory if it's not already there
if [ ! -f "dist/public/netlify-adapter.js" ]; then
  echo "📝 Copying netlify-adapter.js to build output..."
  cp client/public/netlify-adapter.js dist/public/
fi

echo "✅ Build for Netlify completed successfully"
echo "   Your application is ready for deployment"