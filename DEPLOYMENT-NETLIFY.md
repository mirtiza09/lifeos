# Deploying to Netlify

This guide provides step-by-step instructions for deploying the LifeOS application to Netlify. The application is fully configured to work with Netlify's modern serverless functions architecture.

## Prerequisites

1. A GitHub repository containing your LifeOS application code
2. A Netlify account
3. A PostgreSQL database (e.g., Neon, Supabase, Railway)

## Deployment Steps

### 1. Connect Your Repository to Netlify

1. Log in to your Netlify account
2. Click on "Add new site" > "Import an existing project"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the repository containing your LifeOS application

### 2. Configure Build Settings

The repository includes a `netlify.toml` file that already configures the build settings. These settings include:

- **Build command**: `bash build-for-netlify.sh`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`
- **Node version**: 18 (required for modern Netlify Functions)
- **Node bundler**: esbuild (for efficient function bundling)

### 3. Configure Environment Variables

Click on "Site settings" > "Environment variables" and add the following:

- `DATABASE_URL`: Your PostgreSQL connection string (required)

### 4. Deploy Your Site

1. Click on "Deploy site"
2. Wait for the build and deployment process to complete
3. Once deployed, Netlify will provide you with a unique URL for your application

## How It Works

### Modern Netlify Functions

The application uses the new modern Netlify Functions API which provides these benefits:

1. Native support for the Web Platform's Request/Response API
2. Path-based routing via the URLPattern API
3. TypeScript support out of the box
4. Better performance and smaller bundle sizes

### API Routing Architecture

The application is configured to route API requests through Netlify Functions:

1. API requests from the frontend to `/api/*` are automatically rewritten to `/.netlify/functions/*`
2. This is handled by:
   - The `netlify.toml` file which sets up redirects and function configuration
   - The `netlify-adapter.js` which handles client-side routing adjustments
   - The `netlify-build.sh` script which transforms API endpoints into modern Netlify Functions

### Database Connection

The application connects to your PostgreSQL database using the `DATABASE_URL` environment variable. Make sure your database is accessible from Netlify's servers.

## Troubleshooting

### Build Errors with @netlify/functions

If you encounter build errors related to `@netlify/functions`:

1. Make sure your `package.json` has `"@netlify/functions": "^3.0.4"` (or newer) in dependencies
2. Ensure the version matches between your local development and Netlify's build environment
3. If using an older version (like v2.x.x), update to the latest version with `npm install @netlify/functions@latest`
4. Check that your `netlify.toml` correctly includes `external_node_modules = ["@netlify/functions"]`

### Export Errors in Utility Modules

If you encounter errors about missing default exports in your API utility files:

1. Every API utility module (like `_error-handler.js`, `_storage.js`, and `netlify-adapter.js`) must include a default export function
2. The Netlify Functions bundler requires a default export even for utility modules
3. Example for utility modules:
   ```javascript
   export default async function handler(req, res) {
     res.status(200).json({ 
       message: "This is a utility module and shouldn't be called directly",
       success: true
     });
   }
   ```
4. Ensure all imports reference the correct path after bundling

### API 404 Errors

If you're seeing 404 errors for API requests:

1. Check that the build process completed successfully
2. Verify the `netlify/functions` directory was created with all the necessary functions
3. Check Netlify's Function logs in the Netlify dashboard 
4. Ensure the path configuration in each function matches the expected API routes

### Database Connection Issues

If you're having trouble connecting to your database:

1. Verify your `DATABASE_URL` is correct in the environment variables
2. Ensure your database allows connections from Netlify's IP addresses
3. Check for connection errors in the Netlify Function logs

### Custom Domains

To use a custom domain:

1. Go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Follow the steps to verify domain ownership and configure DNS

## Advanced Configuration

### Build Script Internals

The `netlify-build.sh` script handles the transformation of API files into Netlify Functions:

1. It creates a `netlify/api/` directory containing all original API files
2. It creates a `netlify/functions/` directory containing function wrappers
3. For each API file, it creates a corresponding function wrapper with proper imports
4. For utility files, it ensures they're available to all functions
5. The script creates an API catch-all function for handling dynamic routes
6. All paths are carefully managed to ensure correct imports after bundling

### Function-Specific Settings

Each Netlify Function can have its own configuration for:

- **Path routing**: Define exactly which URLs trigger your function
- **Excluded paths**: Prevent the function from running on certain paths
- **Static file preference**: Control whether static files take precedence over functions

### Continuous Deployment

Netlify automatically deploys your site when changes are pushed to your repository. You can configure branch deployments and preview deployments in the Netlify dashboard.

### Build Cache

To improve build times, Netlify caches dependencies between builds. You can clear the cache in the Netlify dashboard if you encounter build issues.

### Function Limitations

Netlify Functions have the following limitations:

- Execution timeout: 10 seconds (26 seconds for paid plans)
- Payload size limit: 10MB
- Function bundle size: 50MB

Keep these limitations in mind when developing your application.