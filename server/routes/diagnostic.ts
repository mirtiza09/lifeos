import { Request, Response } from 'express';

/**
 * Diagnostic endpoint to verify API functionality
 * This endpoint provides information about the current environment
 * and can be used to check if the API is working correctly.
 */
export async function diagnosticRoute(req: Request, res: Response) {
  // Basic environment information
  const environment = {
    node_env: process.env.NODE_ENV || 'development',
    platform: process.env.DEPLOYMENT_PLATFORM || 'unknown',
    database_connected: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
    request_path: req.path,
    request_url: req.url,
    base_url: req.baseUrl,
    original_url: req.originalUrl,
    headers: {
      host: req.headers.host,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
    }
  };

  // Additional platform-specific diagnostics
  let platformInfo = {};
  
  if (process.env.DEPLOYMENT_PLATFORM === 'render') {
    platformInfo = {
      is_render: true,
      render_service_id: process.env.RENDER_SERVICE_ID || 'unknown',
      render_instance_id: process.env.RENDER_INSTANCE_ID || 'unknown',
      render_external_url: process.env.RENDER_EXTERNAL_URL || 'unknown',
    };
  } else if (process.env.DEPLOYMENT_PLATFORM === 'netlify') {
    platformInfo = {
      is_netlify: true,
      netlify_site_name: process.env.SITE_NAME || 'unknown',
      netlify_build_id: process.env.BUILD_ID || 'unknown',
      netlify_context: process.env.CONTEXT || 'unknown',
    };
  }

  // API route information
  const routeInfo = {
    api_path_prefix: req.path.startsWith('/.netlify/functions') ? '/.netlify/functions' : '/api',
    netlify_compatible: req.path.startsWith('/.netlify/functions'),
    render_compatible: req.path.startsWith('/api'),
  };

  // Return all diagnostic information
  res.json({
    status: 'ok',
    message: 'API is functioning correctly',
    environment,
    platform: platformInfo,
    routes: routeInfo,
  });
}