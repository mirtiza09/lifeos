#!/bin/bash

# Set environment variables
export MIGRATE_DATA=true
export USE_POSTGRES=true

# Run the migration script
echo "Starting migration process..."
node migrate.js

echo "Migration completed."