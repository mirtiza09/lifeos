// Netlify adapter script
// This script is meant to be included in the HTML file when deployed to Netlify
// It helps with environment detection and API routing

(function() {
  // Detect if we are on Netlify production
  const isNetlifyProduction = window.location.hostname.includes('netlify.app') || 
                             document.location.hostname.endsWith('.netlify.app');
  
  if (isNetlifyProduction) {
    // Create a global variable to indicate we're on Netlify
    window.DEPLOYMENT_PLATFORM = 'netlify';
    
    // Set API base URL to use the Netlify Functions path for API requests
    window.API_BASE_URL = '/.netlify/functions';
    
    console.log('Netlify deployment detected - API requests will use /.netlify/functions path');
    
    // Patch the fetch API to rewrite API calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      let newUrl = url;
      
      // Only transform URLs that start with /api
      if (typeof url === 'string' && url.startsWith('/api')) {
        // Replace /api with /.netlify/functions
        newUrl = url.replace(/^\/api/, '/.netlify/functions');
        console.log(`Rewriting API request from ${url} to ${newUrl}`);
      }
      
      return originalFetch.call(this, newUrl, options);
    };
  }
})();