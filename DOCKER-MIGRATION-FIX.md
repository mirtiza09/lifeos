# Docker Container Migration Fix

This document explains the changes made to fix the issue where the Docker container was shutting down after the migration completed, even though the Express server started.

## Problem Identified

The container was exiting prematurely due to the following issues:

1. The migration scripts (`run-migrate.ts`, `migrate.js`, etc.) were calling `process.exit(0)` after successful migration, causing the container to exit.
2. In `server/index.ts`, the database setup and Express server startup were combined in a single file.
3. The Dockerfile wasn't properly separating the migration step from the server startup.

## Changes Made

### 1. Created Separate Migration Scripts

Created dedicated migration scripts:

1. Main Script (`server/migrate.ts`):
   - Uses ES module patterns for compatibility
   - Only runs database setup and migration
   - Only exits the process if it's called directly, not when imported
   - Uses `import.meta.url` to detect if it's the main module

2. Fallback Script (`server/setup-db.js`):
   - Uses CommonJS for maximum compatibility
   - Provides a reliable way to set up database tables
   - Used as a backup if the ES module script fails

### 2. Updated Server Logic

Modified `server/index.ts` to:
- Remove the database setup logic
- Focus solely on starting and maintaining the Express server
- Never exit the process except during graceful shutdown

### 3. Created a Startup Shell Script

Created a shell script (`run-app.sh`) that:
- Runs the migration first
- Then starts the server
- Uses `exec` to replace the shell process with the Node.js process
- Only exits if the migration fails

### 4. Updated Dockerfile

Updated the Dockerfile to:
- Build both the server and migration scripts
- Copy the startup shell script to the container
- Use the shell script as the CMD

## Testing

To test these changes locally, follow these steps:

1. Build the Docker image:
   ```
   docker build -t lifeos .
   ```

2. Run the container:
   ```
   docker run -p 5000:5000 --env-file .env lifeos
   ```

3. Check if the container stays alive:
   ```
   docker ps
   ```

4. Verify the application is running by accessing:
   ```
   http://localhost:5000
   ```

5. Check container logs:
   ```
   docker logs <container_id>
   ```

Expected behavior:
- The container should show migration logs followed by server startup logs
- The server should remain running indefinitely
- The application should be accessible at the configured port
- The health check should report success

## Understanding the Fix

The key to this fix is separating the migration process from the server startup process, while ensuring that:

1. The migration runs before the server starts
2. Process exits only happen at the correct times (not after migration)
3. The server process becomes the main process in the container so it keeps running
4. ES module compatibility issues are addressed with fallback options

### ES Module Compatibility

The original error was related to ES modules vs CommonJS compatibility:

```
ReferenceError: module is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/app/package.json' contains "type": "module".
```

We fixed this by:

1. Using proper ES module detection pattern with `import.meta.url` instead of `require.main === module`
2. Adding a CommonJS fallback script that will work regardless of module type
3. Using proper Node.js flags when running the scripts (`--input-type=module` when needed)
4. Making the startup script resilient to failures in the migration step

This approach follows the "one process per container" best practice while still handling the necessary migration step before server startup, and it works reliably regardless of module system configuration.