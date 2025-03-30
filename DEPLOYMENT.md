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
5. The application will be available at `http://localhost:5000`

## Production Deployment with Netlify

LifeOS is optimized for deployment on Netlify using their serverless Functions architecture.

### Netlify Deployment (Recommended)

See detailed instructions in [DEPLOYMENT-NETLIFY.md](./DEPLOYMENT-NETLIFY.md)

The application includes:
- Preconfigured `netlify.toml` for automatic setup
- Build scripts that prepare API endpoints as Netlify Functions
- Client-side adapter for proper API routing

### Alternative: Self-hosted Server

If you prefer to self-host:

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

1. A local PostgreSQL installation for development
2. A managed PostgreSQL service for production:
   - [Neon](https://neon.tech) (recommended, works well with Netlify)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

Make sure to set the `DATABASE_URL` environment variable to point to your database.

### Database Migration

When deploying the application for the first time or after schema changes:

```
npm run db:push
```

This will create/update the database schema based on your Drizzle models.

## Environment Variables

The following environment variable is required:

- `DATABASE_URL`: PostgreSQL connection string

Optional environment variables for local development:

- `PORT`: The port the server will listen on (defaults to 5000)
- `NODE_ENV`: Set to `production` for production mode

## Deployment Checklist

Before deploying to production, make sure to:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Set the required `DATABASE_URL` environment variable in Netlify
4. Deploy with the default settings from `netlify.toml`

## Deployment Architecture

The application uses a modern deployment architecture:

1. **Frontend**: Static files served from Netlify's global CDN
2. **Backend**: API endpoints served as Netlify Functions
3. **Database**: PostgreSQL database connected via `DATABASE_URL`
4. **Routing**: API requests automatically routed from `/api/*` to Netlify Functions

## Troubleshooting

Common deployment issues:

1. **Database connection errors**: 
   - Verify your `DATABASE_URL` is correct
   - Make sure your database allows connections from Netlify's IP addresses
   - Check Netlify Function logs for specific error messages

2. **API errors (404)**: 
   - Verify the build completed successfully
   - Check that Netlify Functions were created properly
   - Look for routing issues in the Function logs

3. **Frontend not loading**: 
   - Check that static files were built and deployed correctly
   - Verify the Netlify adapter script is included in the HTML

For more specific troubleshooting, refer to the [Netlify documentation](https://docs.netlify.com/troubleshooting/common-issues/).