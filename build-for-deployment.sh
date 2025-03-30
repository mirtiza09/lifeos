#!/bin/bash
# Script to build the application for both Vercel and Netlify

echo "Building application for deployment to Vercel and Netlify..."

# Run Vercel build
echo "=== Building for Vercel ==="
bash build-for-vercel.sh

# Run Netlify build
echo "=== Building for Netlify ==="
bash build-for-netlify.sh

echo "Build process complete for both platforms!"
echo "Your application is now ready for deployment."