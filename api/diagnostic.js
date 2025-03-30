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
    let storageInstance = null;
    let dayStartTimeResult = null;
    let dayStartError = null;
    let functionExecutionInfo = {};

    try {
      console.log('[DIAGNOSTIC] Trying to import storage...');
      // Import storage and check type
      const { storage } = await import('./_storage.js');
      storageInstance = storage;
      storageStatus = storage ? `Storage object exists (type: ${typeof storage}, implementation: ${storage._implementation || 'unknown'})` : 'Storage object missing';

      // Try to get the day start time as this seems to be problematic
      console.log('[DIAGNOSTIC] Trying to call getDayStartTime...');
      try {
        dayStartTimeResult = await storage.getDayStartTime();
        console.log('[DIAGNOSTIC] getDayStartTime successful:', dayStartTimeResult);
      } catch (dayErr) {
        dayStartError = {
          message: dayErr.message,
          stack: dayErr.stack
        };
        console.error('[DIAGNOSTIC] getDayStartTime error:', dayErr);
      }

      // Check if pg module is available
      try {
        console.log('[DIAGNOSTIC] Trying to import pg...');
        const pg = await import('pg');
        pgStatus = pg ? 'pg module imported successfully' : 'pg module import returned undefined';

        // If pg imported successfully and DATABASE_URL is set, try a basic pg connection
        if (pg && process.env.DATABASE_URL) {
          console.log('[DIAGNOSTIC] Trying to connect to PostgreSQL...');
          const { Pool } = pg;
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          });

          try {
            const result = await pool.query('SELECT NOW()');
            pgStatus = `PostgreSQL connection successful: ${result.rows[0].now}`;
          } catch (pgConnErr) {
            pgStatus = `PostgreSQL connection error: ${pgConnErr.message}`;
          }
        }
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

      // Try accessing specific important files
      const specialFiles = ['_storage.js', 'pg-netlify-adapter.js', 'netlify-adapter.js', 'day-start-time.js'];
      functionExecutionInfo.fileChecks = {};
      
      for (const file of specialFiles) {
        const filePath = path.join(currentDir, file);
        try {
          const exists = fs.existsSync(filePath);
          const stats = exists ? fs.statSync(filePath) : null;
          functionExecutionInfo.fileChecks[file] = {
            exists,
            size: stats ? stats.size : null,
            mtime: stats ? stats.mtime : null
          };
        } catch (err) {
          functionExecutionInfo.fileChecks[file] = { error: err.message };
        }
      }
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
        implementation: storageInstance ? storageInstance._implementation || 'unknown' : 'unknown',
        pgStatus,
        dayStartTimeResult,
        dayStartError
      },
      fileAccess,
      functionExecutionInfo,
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