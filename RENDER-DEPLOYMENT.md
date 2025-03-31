# Deploying on Render

This guide explains how to deploy the Life OS Dashboard on Render using Docker.

## Prerequisites

1. A [Render](https://render.com) account
2. A [Neon](https://neon.tech) account with a PostgreSQL database
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## What We've Done to Ensure a Successful Deployment

We've made several important modifications to ensure the application runs properly on Render:

1. **Improved Server Stability**: Added proper error handling and process signal handling to keep the Node.js process alive.
2. **Docker Health Checks**: Implemented a health check that verifies the API is responding correctly.
3. **Dockerfile Optimizations**: Ensured all necessary files are included in the production image.
4. **Process Management**: Fixed issues that could cause the container to exit prematurely.

## Deployment Steps

### 1. Set Up Your Neon Database

1. Create a project on Neon
2. Create a database named `neondb` in your project
3. Get your database connection string from the Neon dashboard: `postgres://user:password@host:port/neondb?sslmode=require`

### 2. Deploy on Render

#### Option 1: Using the Dashboard

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your Git repository
4. Choose "Docker" as the environment
5. Set the name to "life-os-dashboard" (or your preferred name)
6. Set environment variables:
   - `DATABASE_URL`: Your Neon database connection string
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
7. Click "Create Web Service"

#### Option 2: Using Blueprint (render.yaml)

1. Make sure the `render.yaml` file is in your repository
2. In Render, go to Dashboard and click "Blueprint"
3. Connect your Git repository
4. Render will detect the render.yaml file and prompt you to configure it
5. Set the `DATABASE_URL` environment variable to your Neon connection string
6. Deploy the blueprint

## Verifying Deployment

1. After deployment completes, click on the generated URL to access your application
2. The frontend should load and connect to the API endpoints
3. Check Render logs for any errors
4. Verify the Docker healthcheck is passing (visible in Render logs)

## Troubleshooting

### Database Connection Issues

If you see database connection errors in the logs:

1. Verify your `DATABASE_URL` is correct
2. Ensure your Neon database is in the same region as your Render service, or at least close by
3. Check if Neon IP restrictions are blocking Render's IP addresses

### Application Not Starting

If the application container exits:

1. Check Render logs for errors
2. Ensure that the healthcheck is passing
3. Verify that all environment variables are correctly set

### Other Issues

1. Check if your server is binding to the correct port (5000) and host (0.0.0.0)
2. Ensure all required environment variables are set
3. Verify that the frontend build is being served correctly
4. If issues persist, try rebuilding the service in Render