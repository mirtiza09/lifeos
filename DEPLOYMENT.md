# Deployment Guide: Life OS Dashboard

This document outlines how to deploy the Life OS Dashboard application to production environments.

## Architecture Overview

The Life OS Dashboard is a full-stack JavaScript application with:

1. **Frontend**: React-based Single Page Application (SPA) using Vite
2. **Backend**: Express.js server with API endpoints
3. **Database**: PostgreSQL database (using NeonDB or similar)

For production deployment, these components need to be deployed separately.

## Deployment Options

### Option 1: Netlify (Frontend) + Separate Backend

#### Frontend Deployment (Netlify)

1. Create a Netlify account and connect your GitHub repository
2. Configure build settings according to `netlify.toml`:
   - Build command: `npm run build:client`
   - Publish directory: `client/dist`
3. Set up environment variables in Netlify dashboard:
   - `VITE_API_URL`: URL of your backend API server

#### Backend Deployment (Recommended Services)

Choose one of these platforms to deploy your Express.js backend:
- **Railway** (Recommended): Developer-friendly deployment with free tier ($5 credit/month ≈ 500 hours)
- **Render**: Offers free tier for web services (90 days)
- **Fly.io**: Modern alternative with generous free tier (3 small VMs)
- **Heroku**: Classic choice, but no longer offers a free tier

Your backend will need:
1. The `DATABASE_URL` environment variable pointing to your PostgreSQL database
2. Proper CORS configuration to allow requests from your Netlify frontend

### Option 2: Vercel (Full Stack Serverless)

Vercel supports deploying both the frontend and backend together as serverless functions:

1. Create a Vercel account and connect your GitHub repository
2. Vercel will automatically detect your project type
3. Set up environment variables in Vercel dashboard:
   - `DATABASE_URL`: PostgreSQL connection string
   - `USE_POSTGRES`: Set to `true`
4. Deploy the project

The project includes the following Vercel-specific files:
- `vercel.json`: Configuration for routing and builds
- `api/` directory: Serverless functions for your backend APIs

For details on converting Express routes to Vercel serverless functions, see [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md).

### Option 3: Replit Deployment (All-in-one)

Replit provides a simpler deployment solution that keeps the frontend and backend together.

1. Use the "Deploy" button in your Replit project
2. Ensure your PostgreSQL database credentials are properly configured
3. No architectural changes are required for this option

## Database Setup

This application requires a PostgreSQL database:

1. **NeonDB** (Recommended): Serverless Postgres with free tier
   - Create an account at https://neon.tech
   - Create a new project and database
   - Copy the connection string to your backend environment as `DATABASE_URL`

2. **Alternative Postgres Providers**:
   - Supabase
   - Railway
   - Heroku Postgres
   - ElephantSQL

## Frontend-Backend Communication

For separate deployments, you'll need to:

1. Update `client/src/lib/queryClient.ts` to use the environment variable for API URL:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '';
   ```

2. Add a build script in `package.json` for building just the client:
   ```json
   "build:client": "vite build"
   ```

3. Ensure CORS is properly configured in the backend:
   ```typescript
   app.use(cors({
     origin: 'https://your-netlify-app.netlify.app',
     credentials: true
   }));
   ```

## Offline Support

The application includes offline support through:
- IndexedDB for local data storage
- Sync service to reconcile local and server data

When deploying, ensure the sync service properly connects to your backend API.

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to 'production' for production deployments

### Frontend
- `VITE_API_URL`: URL to your backend API server

## Regular Maintenance

1. **Database Backups**: Set up regular backups of your PostgreSQL database
2. **Update Dependencies**: Regularly update npm packages for security patches
3. **Monitor Error Logs**: Implement error tracking (e.g., Sentry) to catch and address issues