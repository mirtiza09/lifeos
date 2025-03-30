#!/bin/bash
# Comprehensive build script for Netlify deployment

echo "Starting build process for Netlify..."

# Make the script executable
chmod +x ./netlify-build.sh

# Create essential directories
mkdir -p dist/public
mkdir -p netlify/functions

# Build the frontend with Vite
echo "Building frontend with Vite..."
npm run build

# Move frontend assets to the correct location
echo "Organizing built assets for Netlify..."
if [ -d "dist" ]; then
  # Create the public directory if it doesn't exist
  mkdir -p dist/public
  
  # Move HTML, CSS, JS and assets while preserving directory structure
  find dist -maxdepth 1 -type f -name "*.html" -exec mv {} dist/public/ \;
  find dist -maxdepth 1 -type f -name "*.css" -exec mv {} dist/public/ \;
  find dist -maxdepth 1 -type f -name "*.js" -exec mv {} dist/public/ \;
  find dist -maxdepth 1 -type f -name "*.ico" -exec mv {} dist/public/ \;
  
  # Handle assets directory if it exists
  if [ -d "dist/assets" ]; then
    mkdir -p dist/public/assets
    cp -r dist/assets/* dist/public/assets/
  fi
fi

# Run the Netlify-specific build script
echo "Running Netlify adapter script..."
./netlify-build.sh

echo "Build for Netlify completed successfully!"
echo "You can now deploy using the Netlify CLI or connect your repository to Netlify."
echo "Remember to set up environment variables in the Netlify dashboard."