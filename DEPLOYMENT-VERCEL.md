# Deploying Life OS Dashboard to Vercel

This guide explains how to deploy the Life OS Dashboard application to Vercel's hosting platform, which offers a great free tier option for full-stack applications.

## Why Vercel?

- **Free tier** with generous limits
- **Serverless architecture** for optimal scaling
- **Integrated with GitHub** for continuous deployment
- **Easy environment variable management**
- **Global CDN** for fast content delivery
- **Zero configuration** for many frontend frameworks

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (you can sign up with GitHub)
2. A [Neon PostgreSQL database](https://neon.tech) account (required for data persistence)
3. Your Life OS Dashboard code in a GitHub repository

## Step 1: Set up Neon PostgreSQL Database

1. Create a free account on [Neon.tech](https://neon.tech)
2. Create a new project
3. Once your project is created, navigate to the "Connection Details" tab
4. Copy the connection string provided (it will look like `postgres://user:password@endpoint/database`)

## Step 2: Prepare Your Project

Your project already has the necessary files for Vercel deployment:

- **`vercel.json`**: Configuration file that tells Vercel how to build and deploy your app
- **`api/*.js`**: Serverless function files for the backend API endpoints
- **Client code**: Frontend React application in the client directory

## Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Select "Other" (we have custom configuration)
   - **Build Command**: Leave as is (defined in vercel.json)
   - **Output Directory**: Leave as is (defined in vercel.json)
   - **Environment Variables**: Add the following:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string
     - `USE_POSTGRES`: Set to `true`

5. Click "Deploy"

## Step 4: Verify Deployment

1. Once deployment is complete, Vercel will provide a URL for your application
2. Visit the URL to ensure the application is working correctly
3. Test the basic functionality:
   - Adding/completing tasks
   - Creating/tracking habits
   - Adding notes for each life category

## Troubleshooting

### Database Connection Issues

If you're experiencing database connection issues:

1. Check that your `DATABASE_URL` environment variable is correctly set in the Vercel dashboard
2. Ensure your Neon database is active and not in a sleep state
3. Check that your database schema has been properly migrated (see below)

### Database Migration

To migrate your schema to the new database:

1. Add the `DATABASE_URL` to your local development environment
2. Run the migration script locally:
   ```
   npm run db:push
   ```
3. Alternatively, you can run the migration script directly from Vercel:
   - Go to "Deployments" in your Vercel project
   - Select the latest deployment
   - Navigate to "Functions" tab
   - Find and click on the "Migration" function
   - This will trigger the database migration process

### Application Not Working

If your application is deployed but not functioning correctly:

1. Check the Vercel deployment logs for any errors
2. Ensure all environment variables are set correctly
3. Verify that your API routes are working by testing them directly:
   ```
   https://your-vercel-url.vercel.app/api/tasks
   ```
4. Check browser console for any JavaScript errors

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Any push to the main branch will trigger a new deployment.

To enable previews for pull requests:

1. Go to your Vercel project settings
2. Navigate to "Git Integration"
3. Enable "Preview Deployments"

## Custom Domain (Optional)

To add a custom domain to your Vercel deployment:

1. Go to your Vercel project dashboard
2. Click on "Domains"
3. Add your custom domain and follow the verification steps

## Monitoring and Analytics

Vercel provides basic monitoring and analytics for your deployment:

1. Go to your Vercel project dashboard
2. Navigate to "Analytics" to view traffic and performance metrics
3. Check "Logs" for detailed information about your serverless functions

## Conclusion

Your Life OS Dashboard is now deployed to Vercel with a PostgreSQL database for persistent storage. This setup provides a reliable, scalable solution with minimal maintenance required.

For any further questions or issues, refer to the [Vercel documentation](https://vercel.com/docs) or contact Vercel support.