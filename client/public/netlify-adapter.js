/**
 * Netlify Adapter Script
 * 
 * This script enhances the application when deployed to Netlify by:
 * 1. Detecting if running in a Netlify production environment (including custom domains)
 * 2. Rewriting API calls from standard paths (/api/*) to Netlify Functions paths (/.netlify/functions/*)
 * 3. Setting up global configuration variables for the application
 */

(function() {
  // Enhanced Netlify detection logic
  function detectNetlifyEnvironment() {
    // Local development check
    const isLocalDevelopment = window.location.hostname.includes('localhost') || 
                               window.location.hostname.includes('127.0.0.1');
    
    // Explicit Netlify environment indicators (works for both *.netlify.app and custom domains)
    const hasNetlifyHeaders = document.querySelector('meta[name="x-netlify"]') !== null;
    const isNetlifyDomain = window.location.hostname.includes('.netlify.app');
    const hasNetlifyEnvVar = typeof window.NETLIFY !== 'undefined';
    
    // Netlify sets this cookie on their infrastructure
    const hasNetlifyCookie = document.cookie.includes('nf_');
    
    // Check URL for Netlify preview information
    const urlParams = new URLSearchParams(window.location.search);
    const isNetlifyPreview = urlParams.has('_netlifyDeployID') || urlParams.has('netlify');
    
    // Fallback to production assumption for custom domains
    const productionFallback = !isLocalDevelopment;
    
    // Return true if any Netlify indicators are present
    return isNetlifyDomain || hasNetlifyHeaders || hasNetlifyEnvVar || 
           hasNetlifyCookie || isNetlifyPreview || productionFallback;
  }
  
  // Determine if we're running on Netlify
  const isNetlifyEnvironment = detectNetlifyEnvironment();
  
  if (isNetlifyEnvironment) {
    // Set global configuration for the application
    window.DEPLOYMENT_PLATFORM = 'netlify';
    window.API_BASE_URL = '/api';
    window.NETLIFY_FUNCTIONS_URL = '/.netlify/functions';
    
    console.log('Netlify environment detected - API requests will be directed to Netlify Functions');
    
    // Patch all API request methods to use Netlify Functions path
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      let newUrl = url;
      
      // Only transform URLs that start with /api
      if (typeof url === 'string' && url.startsWith('/api')) {
        // Transform to use the correct Netlify function path
        // Replace /api/ with /.netlify/functions/ to avoid double /api/ path issues
        newUrl = url.replace(/^\/api\//, '/.netlify/functions/');
        console.log(`Rewriting API request: ${url} → ${newUrl}`);
      }
      
      return originalFetch.call(this, newUrl, options);
    };
    
    // Create a global helper for API URL conversion
    window.getNetlifyFunctionUrl = function(apiPath) {
      if (apiPath.startsWith('/api/')) {
        return apiPath.replace(/^\/api\//, '/.netlify/functions/');
      } else if (apiPath.startsWith('/api')) {
        return apiPath.replace(/^\/api/, '/.netlify/functions');
      }
      return apiPath;
    };
    
    // Add a meta tag to indicate Netlify deployment 
    // This helps with environment detection for other scripts
    const meta = document.createElement('meta');
    meta.name = 'deployment-platform';
    meta.content = 'netlify';
    document.head.appendChild(meta);
  }
})();