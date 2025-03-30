# Deploying LifeOS to Vercel

This guide will walk you through the process of deploying the LifeOS application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL database)
3. Git repository with your LifeOS code

## Step 1: Prepare Your Environment Variables

You'll need to set up the following environment variables in Vercel:

- `DATABASE_URL`: Your PostgreSQL connection string (from Neon or another provider)

## Step 2: Deploy to Vercel

### Option 1: Using the Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project with these settings:
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add the environment variables from Step 1
6. Click "Deploy"

### Option 2: Using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Deploy from your project directory:
   ```
   vercel
   ```

4. Follow the prompts to configure your project, or use a configuration file.

5. Set environment variables:
   ```
   vercel env add DATABASE_URL
   ```

## Step 3: Verify Your Deployment

1. Once deployed, Vercel will provide you with a URL for your deployed application.
2. Open the URL in your browser and verify that your application is working correctly.
3. Test the various features to ensure everything is functioning as expected.

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` is correctly configured
- Check if your database provider allows connections from Vercel's IP ranges
- Ensure your database has the necessary tables created (run migrations if needed)

### API Errors

- Check the Vercel Function logs for specific error messages
- Verify that API routes are correctly configured in `vercel.json`
- Make sure your serverless functions have appropriate timeout and memory settings

### Frontend Issues

- Check browser console for any JavaScript errors
- Verify that the build outputs the correct files
- Make sure static assets are being served correctly

## Updating Your Deployment

When you push changes to your Git repository, Vercel will automatically rebuild and redeploy your application if you've set up continuous deployment.

Alternatively, you can manually trigger a new deployment:

```
vercel --prod
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/)