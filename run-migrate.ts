// Import migration functions
import { setupDatabase, migrateData } from './server/migrateToPostgres';

// Force environment variables
process.env.MIGRATE_DATA = 'true';
process.env.USE_POSTGRES = 'true';
// Make sure MIGRATION_COMPLETED is not set when running this script explicitly
delete process.env.MIGRATION_COMPLETED;

async function runMigration() {
  try {
    console.log('Setting up database schema...');
    await setupDatabase();
    console.log('Database schema setup completed.');
    
    console.log('Starting data migration...');
    await migrateData();
    console.log('Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();