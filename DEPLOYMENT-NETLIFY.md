# Deploying LifeOS to Netlify

This guide will walk you through the process of deploying the LifeOS application to Netlify.

## Prerequisites

1. A [Netlify](https://netlify.com) account
2. A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL database)
3. Git repository with your LifeOS code

## Step 1: Prepare Your Environment Variables

You'll need to set up the following environment variables in Netlify:

- `DATABASE_URL`: Your PostgreSQL connection string (from Neon or another provider)

## Step 2: Deploy to Netlify

### Option 1: Using the Netlify Dashboard

1. Go to the [Netlify Dashboard](https://app.netlify.com/start)
2. Click "Import from Git"
3. Connect to your Git provider and select your repository
4. Configure the project with these settings:
   - Build Command: `npm run build:netlify`
   - Publish Directory: `dist/public`
   - Functions Directory: `netlify/functions`
5. Add the environment variables from Step 1
6. Click "Deploy site"

### Option 2: Using the Netlify CLI

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```
   netlify login
   ```

3. Initialize and configure your site:
   ```
   netlify init
   ```

4. Deploy from your project directory:
   ```
   netlify deploy
   ```

5. Once you're satisfied with the preview, deploy to production:
   ```
   netlify deploy --prod
   ```

6. Set environment variables:
   ```
   netlify env:set DATABASE_URL "your-database-url"
   ```

## Step 3: Set Up Redirects and Function Paths

Netlify uses a different URL structure for serverless functions. Our `netlify.toml` file already includes the necessary redirects, but make sure it contains:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

This will route API requests to the correct Netlify Function endpoints.

## Step 4: Verify Your Deployment

1. Once deployed, Netlify will provide you with a URL for your deployed application.
2. Open the URL in your browser and verify that your application is working correctly.
3. Test the various features to ensure everything is functioning as expected.

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` is correctly configured
- Check if your database provider allows connections from Netlify's IP ranges
- Ensure your database has the necessary tables created (run migrations if needed)

### Function Invocation Errors

- Check the Netlify Function logs in the Netlify Dashboard
- Verify that functions are being built correctly during deployment
- Check if the function dependencies are being bundled correctly

### Path/Route Issues

- Verify the redirects in `netlify.toml` are correctly configured
- Check if API calls are being correctly routed to the appropriate functions
- Look for 404 errors in the browser console or network tab

## Continuous Deployment

When you push changes to your Git repository, Netlify will automatically rebuild and redeploy your application if you've set up continuous deployment.

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/)