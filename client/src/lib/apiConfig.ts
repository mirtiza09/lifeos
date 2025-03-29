// API configuration for frontend
// This helps the frontend connect to the right backend API server

// Get the API URL from environment variables, with a fallback for development
// Deployment notes:
// - When deploying to Netlify, set VITE_API_URL in the Netlify environment settings to point to your backend
// - When deploying to Vercel as a full-stack app, this can remain as default
// - When using Replit deployment, this can remain as default
const API_URL = import.meta.env.VITE_API_URL || '';

// If API_URL is empty, we're either in development mode or using a unified deployment (Vercel/Replit)
// In those cases, API requests will use relative URLs which will work correctly
export default API_URL;