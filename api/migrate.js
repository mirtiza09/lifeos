import { sql } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting database migration...');
    
    // Get database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = neon(connectionString);
    const db = drizzle(client, { schema });
    
    // Create tables if they don't exist - with proper column names matching the schema
    await client.execute(`
      DROP TABLE IF EXISTS daily_analytics;
      
      CREATE TABLE daily_analytics (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        total_tasks INTEGER NOT NULL DEFAULT 0,
        completed_tasks INTEGER NOT NULL DEFAULT 0,
        new_tasks_created INTEGER NOT NULL DEFAULT 0,
        total_habits INTEGER NOT NULL DEFAULT 0,
        active_habits INTEGER NOT NULL DEFAULT 0,
        completed_habits INTEGER NOT NULL DEFAULT 0,
        failed_habits INTEGER NOT NULL DEFAULT 0,
        counter_habits_progress TEXT DEFAULT '{}',
        new_habits_created INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER,
        created_at TEXT NOT NULL
      );
    `);
    
    console.log('Migration completed successfully');
    
    // If force parameter is true, add some example data
    if (req.body && req.body.addSampleData) {
      console.log('Adding sample analytics data...');
      
      // Get today's date formatted as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Create sample data for the past 7 days
      const sampleData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Random values for demonstration
        const taskTotal = Math.floor(Math.random() * 10) + 5; // 5-15
        const taskCompleted = Math.floor(Math.random() * (taskTotal + 1));
        const taskActive = taskTotal - taskCompleted;
        const habitTotal = Math.floor(Math.random() * 8) + 2; // 2-10
        const habitActive = habitTotal;
        const habitCompleted = Math.floor(Math.random() * habitActive);
        const habitFailed = Math.floor(Math.random() * (habitActive - habitCompleted));
        const habitCompletionRate = habitActive > 0 ? habitCompleted / habitActive : 0;
        
        // Add sample record - matching column names in our schema
        const newTasksCreated = Math.floor(Math.random() * 3);
        const newHabitsCreated = Math.floor(Math.random() * 2);
        const createdAt = new Date().toISOString();
        
        await client.execute(`
          INSERT INTO daily_analytics 
          (date, total_tasks, completed_tasks, new_tasks_created, 
           total_habits, active_habits, completed_habits, failed_habits, 
           counter_habits_progress, new_habits_created, created_at)
          VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (date) DO UPDATE SET
          total_tasks = EXCLUDED.total_tasks,
          completed_tasks = EXCLUDED.completed_tasks,
          new_tasks_created = EXCLUDED.new_tasks_created,
          total_habits = EXCLUDED.total_habits,
          active_habits = EXCLUDED.active_habits,
          completed_habits = EXCLUDED.completed_habits,
          failed_habits = EXCLUDED.failed_habits,
          counter_habits_progress = EXCLUDED.counter_habits_progress,
          new_habits_created = EXCLUDED.new_habits_created,
          created_at = EXCLUDED.created_at
        `, [
            dateStr, 
            taskTotal, 
            taskCompleted, 
            newTasksCreated,
            habitTotal, 
            habitActive, 
            habitCompleted, 
            habitFailed, 
            '{}', // counter_habits_progress - empty JSON object
            newHabitsCreated, 
            createdAt
        ]);
        
        sampleData.push({
          date: dateStr,
          taskTotal,
          taskActive,
          taskCompleted,
          habitTotal,
          habitActive,
          habitCompleted,
          habitCompletionRate: (habitCompletionRate * 100).toFixed(0) + '%'
        });
      }
      
      console.log('Sample data added successfully');
      return res.status(200).json({ 
        message: 'Migration completed and sample data added successfully',
        sampleData
      });
    }
    
    // Return success
    return res.status(200).json({ message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      message: 'Migration failed',
      error: error.message
    });
  }
}