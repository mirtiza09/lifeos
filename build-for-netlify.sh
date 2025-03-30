#!/bin/bash
# Script to run the regular build and then prepare for Netlify deployment

# Run the standard build
npm run build

# Execute the Netlify-specific build script
bash netlify-build.sh

echo "Build for Netlify completed successfully"