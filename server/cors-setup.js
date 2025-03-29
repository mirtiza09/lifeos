// Copy this file to your backend server code after forking repository
// This helps adapt the backend to allow communication with the frontend on Netlify

import cors from 'cors';

// Configure CORS for your deployed frontend
export function setupCors(app) {
  // Configure CORS to allow your Netlify URL
  const allowedOrigins = [
    // Local development URL
    'http://localhost:3000',
    // Add your Netlify URL when you have it
    'https://your-netlify-app.netlify.app',
    // Add additional production domains if needed
  ];
  
  // CORS middleware configuration
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      
      return callback(null, true);
    },
    credentials: true // Allow cookies and authentication headers
  }));
  
  console.log('CORS configured for backend API server');
}