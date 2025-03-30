# Deploying to Render

This guide provides instructions for deploying the LifeOS application to Render.

## Setup Process

### 1. Create a Render Account

If you don't already have one, sign up for a Render account at [render.com](https://render.com).

### 2. Create a New Web Service

1. From your Render dashboard, click on "New" and select "Web Service"
2. Connect your GitHub repository
3. Fill in the details:
   - Name: `lifeos` (or your preferred name)
   - Environment: `Node`
   - Region: Choose the closest to your users
   - Branch: `main` (or your deployment branch)
   - Build Command: `./render-build.sh`
   - Start Command: `npm start`

### 3. Configure Environment Variables

1. In the "Environment" section of your service settings, add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`
   - Any other environment variables your app requires

### 4. Deploy

Click "Create Web Service" to deploy your application.

## Key Features of the Render Deployment

### Path Handling

The application includes special configuration to handle Netlify-style paths (`/.netlify/functions/*`). This ensures that if your frontend code contains references to these Netlify-specific paths, they will still work properly on Render.

### Render Adapter

A custom `render-adapter.js` script detects when the application is running on Render and adjusts the API endpoints appropriately. This provides compatibility with code that was originally designed for Netlify Functions.

## Troubleshooting

### API 404 Errors

If you're experiencing 404 errors when accessing API endpoints:

1. Check the browser console for detailed error messages
2. Verify that the `render-adapter.js` is properly loaded (you should see a console message)
3. Ensure your Render environment variables are correctly set
4. Try accessing the `/api-check` endpoint to verify the API is functional

### Database Connection Issues

If you're having trouble connecting to your database:

1. Verify your `DATABASE_URL` is correct in the environment variables
2. Ensure your database allows connections from Render's IP addresses
3. Check for connection errors in the application logs

### Custom Domains

To use a custom domain:

1. Go to the "Settings" tab of your web service
2. In the "Custom Domain" section, click "Add Custom Domain"
3. Follow the steps to verify domain ownership and configure DNS

## Monitoring and Logs

Render provides built-in monitoring and logs:

1. Go to your web service dashboard
2. Click on the "Logs" tab to see application output
3. Use the "Metrics" tab to monitor performance

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Custom Domain Setup](https://render.com/docs/custom-domains)