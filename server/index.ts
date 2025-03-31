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
    if (path.startsWith("/api")) {
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
  try {
    // Setup database tables if using PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        log('Setting up database tables...');
        await setupDatabase();
        log('Database tables setup completed.');
        
        // Database setup completed - no migration in normal startup
        log('Database ready to use.');
      } catch (error) {
        log(`Error during database setup/migration: ${error}`);
        // Continue even if there's a database error - don't exit
      }
    }
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      log(`Error in request handling: ${err.message}`);
      // Don't throw - that would crash the server
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server is running on port ${port}`);
    });

    // Handle process termination signals properly
    const shutdownGracefully = () => {
      log('Shutting down gracefully...');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        log('Forcing server shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', shutdownGracefully);
    process.on('SIGTERM', shutdownGracefully);
    
    // Keep the Node.js process alive even if there are unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Promise Rejection: ${reason}`);
      // Don't exit the process
    });
    
  } catch (error) {
    log(`Fatal server error: ${error}`);
    // Don't exit - let the container management handle restarts if needed
  }
})();
