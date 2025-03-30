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

# Ensure necessary directories exist
mkdir -p netlify/api
mkdir -p netlify/functions

# Copy API files manually first, before calling netlify-build.sh
echo "📋 Copying API files to Netlify directories..."
cp -r api/* netlify/api/

# IMPORTANT: Remove the client-side netlify-adapter.js if it was accidentally copied
# This prevents conflicts between the server-side and client-side adapters
if [ -f "netlify/api/netlify-adapter.js" ]; then
  echo "⚠️ Removing client-side netlify-adapter.js from API directory..."
  rm netlify/api/netlify-adapter.js
fi

# Also copy API files directly to where they need to be
mkdir -p netlify/api/analytics
mkdir -p netlify/api/habits
mkdir -p netlify/api/tasks
mkdir -p netlify/api/notes

# Verify API files are copied
if ! ls -la netlify/api/*.js > /dev/null 2>&1; then
  echo "⚠️ Warning: No API files found in netlify/api directory"
  # Continue anyway as there might be only subdirectories
fi

# Execute the Netlify-specific build script to prepare API endpoints as functions
echo "🔧 Preparing Netlify Functions..."
bash netlify-build.sh

# Debug: Show what files were created
echo "🔍 DEBUG: Checking Netlify build output structure..."
echo "API files in netlify/api:"
ls -la netlify/api/ || echo "No files found!"
echo "Function directories in netlify/functions:"
ls -la netlify/functions/ || echo "No files found!"
echo "Contents of a sample function (habits if available):"
ls -la netlify/functions/habits/ || echo "Habits function not found!"

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