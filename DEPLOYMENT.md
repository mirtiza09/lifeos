# Deploying LifeOS

This guide provides deployment instructions for both local development and production environments.

## Local Development

To run the application locally for development:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file at the root of the project with the following:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. The application will be available at `http://localhost:3000`

## Production Deployment

For production deployment, you have several options:

### Option 1: Vercel (Recommended for simplicity)

See detailed instructions in [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md)

### Option 2: Netlify

See detailed instructions in [DEPLOYMENT-NETLIFY.md](./DEPLOYMENT-NETLIFY.md)

### Option 3: Self-hosted Server

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

3. For production hosting, consider using a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start dist/index.js
   ```

## Database Setup

The application requires a PostgreSQL database. You can use:

1. A local PostgreSQL installation
2. A managed PostgreSQL service like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com)

Make sure to set the `DATABASE_URL` environment variable to point to your database.

### Database Migration

When deploying the application for the first time or after schema changes:

```
npm run db:push
```

This will create/update the database schema based on your Drizzle models.

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string

Optional environment variables:

- `PORT`: The port the server will listen on (defaults to 3000)
- `NODE_ENV`: Set to `production` for production mode

## Deployment Checklist

Before deploying to production, make sure to:

1. Build the application in production mode
2. Set all required environment variables
3. Ensure the database is properly set up and migrated
4. Configure proper error logging
5. Set up HTTPS if not provided by your hosting platform
6. Test all functionalities after deployment

## Troubleshooting

Common deployment issues:

1. **Database connection errors**: Verify your `DATABASE_URL` is correct and that the database is accessible from your hosting environment.

2. **Build failures**: Check that all dependencies are properly installed and compatible.

3. **API errors**: Check the server logs for detailed error messages.

4. **Frontend not loading**: Verify that static files are being served correctly.

For more specific troubleshooting, refer to the documentation for your hosting platform.