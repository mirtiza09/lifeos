// API configuration for frontend
// This helps the frontend connect to the right backend API server

// Get the API URL from environment variables, with a fallback for development
// Deployment notes:
// - In development, API requests use relative URLs to the local development server
// - When deploying to Netlify with serverless functions, the netlify-adapter.js handles
//   rewriting API calls to use the /.netlify/functions path
const API_URL = import.meta.env.VITE_API_URL || '';

// API_URL will be empty for local development and will be automatically
// transformed by netlify-adapter.js when deployed to Netlify
export default API_URL;