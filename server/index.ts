import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./migrateToPostgres";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith("/.netlify/functions")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup database tables if using PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      // Skip migration if MIGRATION_COMPLETED is set to prevent loops in deployment
      if (process.env.MIGRATION_COMPLETED === 'true') {
        log('Migration already completed, skipping database setup');
      } else {
        log('Setting up database tables...');
        await setupDatabase();
        log('Database tables setup completed.');
        
        // Set environment variable to prevent future migrations
        process.env.MIGRATION_COMPLETED = 'true';
        
        // Database setup completed - no migration in normal startup
        log('Database ready to use.');
      }
    } catch (error) {
      log(`Error during database setup/migration: ${error}`);
    }
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the PORT environment variable if provided (needed for Render), 
  // otherwise default to port 5000 for local development
  // This serves both the API and the client
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running at http://0.0.0.0:${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Platform: ${process.env.DEPLOYMENT_PLATFORM || 'local'}`);
  });
})();
