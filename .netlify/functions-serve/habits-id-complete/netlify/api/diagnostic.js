/**
 * Diagnostic API Endpoint
 * 
 * This utility endpoint helps debug issues with the Netlify Functions deployment.
 * It reports on various aspects of the environment and configuration.
 */

export default async function handler(req, res) {
  try {
    // Collect environment information
    const environment = {
      nodeVersion: process.version,
      netlifyDev: process.env.NETLIFY_DEV === 'true',
      context: process.env.CONTEXT || 'unknown',
      netlifyLocal: process.env.NETLIFY_LOCAL === 'true',
      databaseUrl: process.env.DATABASE_URL ? `Present (length: ${process.env.DATABASE_URL.length})` : 'Not set',
      env: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN') && !key.includes('PASSWORD')),
    };

    // Attempt to import storage module and related dependencies
    let storageStatus = 'Unknown';
    let pgStatus = 'Not tested';
    let importErrors = [];

    try {
      // Import storage and check type
      const { storage } = await import('./_storage.js');
      storageStatus = storage ? `Storage object exists (type: ${typeof storage})` : 'Storage object missing';

      // Check if pg module is available
      try {
        const pg = await import('pg');
        pgStatus = pg ? 'pg module imported successfully' : 'pg module import returned undefined';
      } catch (pgError) {
        pgStatus = `Error importing pg: ${pgError.message}`;
        importErrors.push({ module: 'pg', error: pgError.message });
      }
    } catch (storageError) {
      storageStatus = `Error importing storage: ${storageError.message}`;
      importErrors.push({ module: 'storage', error: storageError.message });
    }

    // Check file access
    let fileAccess = {
      status: 'Not checked'
    };

    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get current file location
      const currentFile = new URL(import.meta.url).pathname;
      const currentDir = path.dirname(currentFile);
      
      // List files in api directory
      const files = fs.readdirSync(currentDir);
      
      fileAccess = {
        status: 'Success',
        currentFile,
        currentDir,
        files
      };
    } catch (fsError) {
      fileAccess = {
        status: 'Error',
        message: fsError.message
      };
    }

    // Return diagnostic information
    return res.status(200).json({
      success: true,
      message: 'Diagnostic information gathered successfully',
      timestamp: new Date().toISOString(),
      requestPath: req.url,
      requestMethod: req.method,
      environment,
      storage: {
        status: storageStatus,
        pgStatus
      },
      fileAccess,
      importErrors: importErrors.length > 0 ? importErrors : null,
      requestHeaders: Object.fromEntries(
        Object.entries(req.headers || {})
          .filter(([key]) => !key.includes('authorization') && !key.includes('cookie'))
      )
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error gathering diagnostic information',
      error: error.message,
      stack: error.stack
    });
  }
}