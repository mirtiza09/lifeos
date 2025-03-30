#!/bin/bash

# Set environment variables
export MIGRATE_DATA=true
export USE_POSTGRES=true

# Make sure MIGRATION_COMPLETED is not set when running this script explicitly
# We want the migration to run when executing this script
unset MIGRATION_COMPLETED

# Run the migration script
echo "Starting migration process..."
node migrate.js

# Set the MIGRATION_COMPLETED flag to prevent further migration attempts
export MIGRATION_COMPLETED=true
echo "Migration completed. MIGRATION_COMPLETED flag set to prevent repeated migrations."