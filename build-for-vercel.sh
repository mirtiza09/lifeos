#!/bin/bash
# Script to run the regular build and then prepare for Vercel deployment

# Run the standard build
npm run build

# Execute the Vercel-specific build script
bash vercel-build.sh

echo "Build for Vercel completed successfully"