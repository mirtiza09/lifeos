#!/usr/bin/env node

// Script to manually execute data migration
// This is an ESM module

// Set the MIGRATE_DATA environment variable
process.env.MIGRATE_DATA = 'true';

// Run the migration process
import { migrateData } from './server/migrateToPostgres.js';

async function runMigration() {
  try {
    console.log('Starting data migration process...');
    await migrateData();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();