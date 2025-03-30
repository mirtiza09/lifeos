/**
 * Render Deployment Adapter for LifeOS
 * 
 * This script adapts API requests to work with Render's deployment environment.
 * It ensures proper routing of API requests and helps with platform detection.
 * 
 * Include this script on pages deployed to Render to ensure proper API routing.
 */

(function() {
  console.log('Render adapter initialized');
  
  // Set global deployment platform for use in API configuration
  window.DEPLOYMENT_PLATFORM = 'render';
  
  // Handle path prefixes specific to Render deployment
  const apiPaths = {
    standard: '/api',
    netlify: '/.netlify/functions'
  };
  
  // Intercept fetch requests to handle different API path formats
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string') {
      // For compatibility with code that may use Netlify paths, rewrite them to standard API paths
      if (url.startsWith('/.netlify/functions/')) {
        const rewrittenUrl = url.replace('/.netlify/functions/', '/api/');
        console.log(`Render compatibility: Rewriting path from ${url} to ${rewrittenUrl}`);
        return originalFetch(rewrittenUrl, options);
      }
    }
    
    // Default behavior for all other requests
    return originalFetch(url, options);
  };
  
  // Add a diagnostic endpoint for debugging platform detection
  window.renderAdapterDiagnostic = function() {
    return {
      platform: 'render',
      apiPaths,
      hostname: window.location.hostname,
      href: window.location.href
    };
  };
  
  console.log('Render adapter ready: API requests will be properly routed');
})();