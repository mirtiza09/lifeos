# Life OS Dashboard

A dynamic personal dashboard app that transforms productivity tracking into an engaging, adaptive user experience through intelligent design and interactive features.

## Features

- Task management with completion tracking
- Habit tracking (daily and weekly) with both boolean and counter types
- Life category notes with Markdown support for Health, Career, Finances, and Personal areas
- Offline support with data synchronization
- Responsive design for desktop and mobile
- PostgreSQL database for persistent data storage

## Architecture

This is a full-stack JavaScript application with:
- React frontend (built with Vite)
- Express.js backend
- PostgreSQL database for data persistence

For more detailed information on the architecture, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Database Setup

The application is configured to use PostgreSQL for data persistence:

1. Make sure you have a PostgreSQL database connection string available
2. Add it to your environment variables as `DATABASE_URL`
3. Run database migration:
   ```
   npm run db:push
   ```

## Deployment

### Deploy to Netlify (Full Stack Serverless)

The application now has enhanced Netlify serverless Functions support for reliable deployment.

See [DEPLOYMENT-NETLIFY.md](./DEPLOYMENT-NETLIFY.md) for detailed deployment instructions.

1. Push your code to GitHub
2. Import your project into Netlify using the provided `netlify.toml` configuration
3. Set environment variables for your PostgreSQL database
4. Deploy with a single click

#### Netlify-specific Features

- **Modern Netlify Functions**: Uses the latest Netlify Functions API for better performance
- **Automatic API Routing**: API requests are routed through Netlify Functions with zero configuration
- **Zero-config Deployment**: The `netlify.toml` file and build scripts handle all deployment configuration
- **Path-based Routing**: Each API endpoint gets its own function with proper path configuration
- **Dynamic Route Parameters**: Route parameters (like `/habits/[id]`) are properly transformed to Netlify-compatible function names and routes
- **Compliant Function Names**: All function names follow Netlify's naming conventions (alphanumeric, hyphens, underscores only)
- **Default Exports**: All utility modules include necessary default exports for Netlify compatibility

#### Recent Improvements

- Fixed function naming for dynamic routes to comply with Netlify requirements
- Enhanced parameter handling for nested routes
- Added detailed troubleshooting documentation
- Improved automatic build process for complex directory structures

The application is fully optimized for Netlify's serverless architecture, creating a seamless deployment experience.

### Alternative: Deploy to Replit

1. Use the "Deploy" button in your Replit project
2. No architectural changes required for this option

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required for production)

## License

MIT