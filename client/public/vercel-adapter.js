// Vercel adapter script
// This script is meant to be included in the HTML file when deployed to Vercel
// It helps with environment detection and API routing

(function() {
  // Detect if we are on Vercel production
  const isVercelProduction = window.location.hostname.includes('vercel.app') || 
                          window.location.hostname.includes('lifeOS');
  
  if (isVercelProduction) {
    // Create a global variable to indicate we're on Vercel
    window.DEPLOYMENT_PLATFORM = 'vercel';
    
    // Set API base URL to be the same domain for Vercel full-stack deployments
    window.API_BASE_URL = '';
    
    console.log('Vercel deployment detected - API requests will use relative URLs');
  }
})();