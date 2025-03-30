// API configuration for frontend
// This helps the frontend connect to the right backend API server

// Detect the deployment platform (defined by adapter scripts)
const getDeploymentPlatform = (): string => {
  if (typeof window !== 'undefined') {
    // Check window object for deployment platform set by adapters
    if ((window as any).DEPLOYMENT_PLATFORM === 'netlify') {
      return 'netlify';
    } else if ((window as any).DEPLOYMENT_PLATFORM === 'render') {
      return 'render';
    }
    
    // If no platform is explicitly set, try to detect it from the hostname
    const hostname = window.location.hostname;
    if (hostname.includes('.netlify.app') || hostname.includes('.netlify.com')) {
      return 'netlify';
    } else if (hostname.includes('.onrender.com') || hostname.includes('.render.com')) {
      return 'render';
    }
  }
  
  // Default to standard API paths for local development or unknown platforms
  return 'standard';
};

// Get the deployment platform for use in API URL construction
const DEPLOYMENT_PLATFORM = getDeploymentPlatform();

// Get the API URL from environment variables, with a fallback for development
const API_URL = import.meta.env.VITE_API_URL || '';

// Platform-specific path prefixes
export const API_PATH_PREFIX = DEPLOYMENT_PLATFORM === 'netlify' ? '/.netlify/functions' : '/api';

// Log the detected platform configuration
console.log(`API configuration: Platform=${DEPLOYMENT_PLATFORM}, PathPrefix=${API_PATH_PREFIX}`);

// API_URL will be empty for local development and will be handled by the adapters
// in the Netlify or Render environments
export default API_URL;