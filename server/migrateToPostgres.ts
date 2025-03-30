import { MemStorage } from './storage';
import { PgStorage } from './pgStorage';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, tasks, habits, notes } from '@shared/schema';
import type { Habit } from '@shared/schema';

async function migrateData() {
  // Skip if already migrated to prevent infinite loops in production
  if (process.env.MIGRATION_COMPLETED === 'true') {
    console.log('Migration already completed, skipping data migration');
    return;
  }
  
  try {
    console.log('Starting migration from file-based storage to PostgreSQL...');
    
    // Initialize storages
    const memStorage = new MemStorage();
    const pgStorage = new PgStorage();
    
    // Make sure tables exist in PostgreSQL
    await setupDatabase();
    
    // Migrate tasks
    console.log('Migrating tasks...');
    const allTasks = await memStorage.getTasks();
    for (const task of allTasks) {
      try {
        // Remove id to let the database generate a new one
        const { id, ...taskData } = task;
        await pgStorage.createTask(taskData);
      } catch (err) {
        console.error(`Error migrating task ${task.id}:`, err);
      }
    }
    console.log(`Migrated ${allTasks.length} tasks`);

    // Migrate habits
    console.log('Migrating habits...');
    const allHabits = await memStorage.getHabits();
    for (const habit of allHabits) {
      try {
        // Create a clean habit object without computed properties
        const habitData = {
          name: habit.name,
          type: habit.type,
          value: habit.value,
          maxValue: habit.maxValue,
          status: habit.status,
          repeatType: habit.repeatType,
          repeatDays: habit.repeatDays,
          userId: habit.userId,
          lastReset: habit.lastReset
        };
        await pgStorage.createHabit(habitData);
      } catch (err) {
        console.error(`Error migrating habit ${habit.id}:`, err);
      }
    }
    console.log(`Migrated ${allHabits.length} habits`);

    // Migrate notes
    console.log('Migrating notes...');
    const allNotes = await memStorage.getNotes();
    for (const note of allNotes) {
      try {
        // Remove id to let the database generate a new one
        const { id, ...noteData } = note;
        await pgStorage.createNote(noteData);
      } catch (err) {
        console.error(`Error migrating note ${note.id}:`, err);
      }
    }
    console.log(`Migrated ${allNotes.length} notes`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

async function setupDatabase() {
  // Skip if already migrated to prevent infinite loops in production
  if (process.env.MIGRATION_COMPLETED === 'true') {
    console.log('Migration already completed, skipping database schema setup');
    return;
  }
  
  console.log('Setting up database schema...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Use the migrator to create tables
  const migrationClient = postgres(databaseUrl, { max: 1 });
  
  // Create an instance of Drizzle ORM
  const db = drizzle(migrationClient);
  
  try {
    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value INTEGER DEFAULT 0,
        max_value INTEGER,
        status TEXT,
        repeat_type TEXT NOT NULL DEFAULT 'daily',
        repeat_days TEXT DEFAULT '1,2,3,4,5,6,7',
        user_id INTEGER REFERENCES users(id),
        last_reset TEXT
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        content TEXT DEFAULT '',
        updated_at TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
    `);
    
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  } finally {
    // Close the database connection
    await migrationClient.end();
  }
}

// For ESM compatibility - detect if this file is executed directly
// In ESM, we can use import.meta.url to check if this is the main module
if (import.meta.url.endsWith(process.argv[1].replace('file://', ''))) {
  migrateData()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateData, setupDatabase };