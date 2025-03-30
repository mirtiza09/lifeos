/**
 * PostgreSQL Adapter for Netlify Functions
 * 
 * This module provides a PostgreSQL-based implementation of the storage interface
 * for Netlify Functions. It connects directly to the PostgreSQL database using
 * the DATABASE_URL environment variable.
 */

/**
 * Default export handler for Netlify Functions compatibility
 * This empty handler is required for the Netlify Function wrapper to work correctly
 */
export default async function handler(req, res) {
  res.status(200).json({ 
    message: "This is a utility module and shouldn't be called directly",
    success: true
  });
}

// Import the pg module
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool
let pool;

// Factory function to create a PostgreSQL-based storage instance
export const createPgStorage = () => {
  // Initialize pool if not already created
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('ERROR: DATABASE_URL environment variable is missing');
      throw new Error('DATABASE_URL environment variable is required');
    }

    console.log(`Initializing PostgreSQL connection (URL length: ${databaseUrl.length})`);
    
    pool = new Pool({
      connectionString: databaseUrl,
      // Enable SSL with rejectUnauthorized set to false for Netlify
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test the connection
    pool.query('SELECT NOW()')
      .then(() => console.log('PostgreSQL database connection successful'))
      .catch(err => {
        console.error('PostgreSQL connection error:', err.message);
        console.error('Stack trace:', err.stack);
      });
  }

  return {
    // User methods
    async getUser(id) {
      try {
        const result = await pool.query(
          'SELECT * FROM users WHERE id = $1',
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in getUser:', error);
        throw error;
      }
    },
    
    async getUserByUsername(username) {
      try {
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [username]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in getUserByUsername:', error);
        throw error;
      }
    },
    
    async createUser(userData) {
      try {
        const result = await pool.query(
          'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
          [userData.username, userData.password]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
      }
    },
    
    // Task methods
    async getTasks() {
      try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY completed ASC, created_at DESC');
        return result.rows;
      } catch (error) {
        console.error('Error in getTasks:', error);
        throw error;
      }
    },
    
    async getTask(id) {
      try {
        const result = await pool.query(
          'SELECT * FROM tasks WHERE id = $1',
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in getTask:', error);
        throw error;
      }
    },
    
    async createTask(taskData) {
      try {
        console.log('Creating task with data:', JSON.stringify(taskData));
        
        // Extract task properties with defaults
        const text = taskData.text;
        const completed = taskData.completed || false;
        const createdAt = taskData.createdAt || new Date().toISOString();
        const userId = taskData.userId || null;
        
        const result = await pool.query(
          'INSERT INTO tasks (text, completed, created_at, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [text, completed, createdAt, userId]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error in createTask:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
      }
    },
    
    async updateTask(id, taskData) {
      try {
        // Build the SET part of the query dynamically based on what's provided
        const updates = [];
        const values = [];
        
        if ('text' in taskData) {
          updates.push(`text = $${updates.length + 1}`);
          values.push(taskData.text);
        }
        
        if ('completed' in taskData) {
          updates.push(`completed = $${updates.length + 1}`);
          values.push(taskData.completed);
        }
        
        if ('createdAt' in taskData) {
          updates.push(`created_at = $${updates.length + 1}`);
          values.push(taskData.createdAt);
        }
        
        if ('userId' in taskData) {
          updates.push(`user_id = $${updates.length + 1}`);
          values.push(taskData.userId);
        }
        
        // If there's nothing to update, return null
        if (updates.length === 0) return null;
        
        // Add the ID as the last parameter
        values.push(id);
        
        const query = `
          UPDATE tasks
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING *
        `;
        
        const result = await pool.query(query, values);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in updateTask:', error);
        throw error;
      }
    },
    
    async deleteTask(id) {
      try {
        const result = await pool.query(
          'DELETE FROM tasks WHERE id = $1 RETURNING *',
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error('Error in deleteTask:', error);
        throw error;
      }
    },
    
    // Habit methods
    async getHabits() {
      try {
        const result = await pool.query('SELECT * FROM habits');
        const habits = result.rows;
        
        // Add isActiveToday field to each habit
        return habits.map(habit => ({
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        }));
      } catch (error) {
        console.error('Error in getHabits:', error);
        throw error;
      }
    },
    
    async getHabit(id) {
      try {
        const result = await pool.query(
          'SELECT * FROM habits WHERE id = $1',
          [id]
        );
        
        const habit = result.rows[0];
        if (!habit) return null;
        
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in getHabit:', error);
        throw error;
      }
    },
    
    async createHabit(habitData) {
      try {
        // Convert array to string for database storage if needed
        let repeatDays = habitData.repeatDays;
        if (Array.isArray(repeatDays)) {
          repeatDays = repeatDays.join(',');
        }
        
        const result = await pool.query(
          `INSERT INTO habits (
            name, type, value, max_value, status, repeat_type, repeat_days, user_id, last_reset
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            habitData.name,
            habitData.type || 'boolean',
            habitData.value || 0,
            habitData.maxValue || 0,
            habitData.status || 'pending',
            habitData.repeatType || 'daily',
            repeatDays || '*',
            habitData.userId || null,
            habitData.lastReset || new Date().toISOString()
          ]
        );
        
        const habit = result.rows[0];
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in createHabit:', error);
        throw error;
      }
    },
    
    async updateHabit(id, habitData) {
      try {
        // Build the SET part of the query dynamically based on what's provided
        const updates = [];
        const values = [];
        
        // Handle repeatDays specially - convert array to string
        if ('repeatDays' in habitData) {
          let repeatDays = habitData.repeatDays;
          if (Array.isArray(repeatDays)) {
            repeatDays = repeatDays.join(',');
          }
          updates.push(`repeat_days = $${updates.length + 1}`);
          values.push(repeatDays);
        }
        
        const fields = {
          name: 'name',
          type: 'type',
          value: 'value',
          maxValue: 'max_value',
          status: 'status',
          repeatType: 'repeat_type',
          userId: 'user_id',
          lastReset: 'last_reset'
        };
        
        // Add all the other fields
        for (const [jsField, dbField] of Object.entries(fields)) {
          if (jsField in habitData) {
            updates.push(`${dbField} = $${updates.length + 1}`);
            values.push(habitData[jsField]);
          }
        }
        
        // If there's nothing to update, return null
        if (updates.length === 0) return null;
        
        // Add the ID as the last parameter
        values.push(id);
        
        const query = `
          UPDATE habits
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING *
        `;
        
        const result = await pool.query(query, values);
        const habit = result.rows[0];
        
        if (!habit) return null;
        
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in updateHabit:', error);
        throw error;
      }
    },
    
    async completeHabit(id) {
      try {
        const result = await pool.query(
          'UPDATE habits SET status = $1 WHERE id = $2 RETURNING *',
          ['completed', id]
        );
        
        const habit = result.rows[0];
        if (!habit) return null;
        
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in completeHabit:', error);
        throw error;
      }
    },
    
    async failHabit(id) {
      try {
        const result = await pool.query(
          'UPDATE habits SET status = $1 WHERE id = $2 RETURNING *',
          ['failed', id]
        );
        
        const habit = result.rows[0];
        if (!habit) return null;
        
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in failHabit:', error);
        throw error;
      }
    },
    
    async resetHabitStatus(id) {
      try {
        const result = await pool.query(
          'UPDATE habits SET status = $1 WHERE id = $2 RETURNING *',
          ['pending', id]
        );
        
        const habit = result.rows[0];
        if (!habit) return null;
        
        return {
          ...habit,
          isActiveToday: isHabitActiveToday(habit)
        };
      } catch (error) {
        console.error('Error in resetHabitStatus:', error);
        throw error;
      }
    },
    
    async incrementHabit(id) {
      try {
        // First get the current habit to check the type and get the current value
        const habitResult = await pool.query(
          'SELECT * FROM habits WHERE id = $1',
          [id]
        );
        
        const habit = habitResult.rows[0];
        if (!habit || habit.type !== 'counter') return null;
        
        const currentValue = habit.value || 0;
        const maxValue = habit.max_value || 0;
        const newValue = Math.min(currentValue + 1, maxValue);
        const newStatus = newValue >= maxValue ? 'completed' : 'pending';
        
        const result = await pool.query(
          'UPDATE habits SET value = $1, status = $2 WHERE id = $3 RETURNING *',
          [newValue, newStatus, id]
        );
        
        const updatedHabit = result.rows[0];
        if (!updatedHabit) return null;
        
        return {
          ...updatedHabit,
          isActiveToday: isHabitActiveToday(updatedHabit)
        };
      } catch (error) {
        console.error('Error in incrementHabit:', error);
        throw error;
      }
    },
    
    async decrementHabit(id) {
      try {
        // First get the current habit to check the type and get the current value
        const habitResult = await pool.query(
          'SELECT * FROM habits WHERE id = $1',
          [id]
        );
        
        const habit = habitResult.rows[0];
        if (!habit || habit.type !== 'counter') return null;
        
        const currentValue = habit.value || 0;
        const maxValue = habit.max_value || 0;
        const newValue = Math.max(currentValue - 1, 0);
        const newStatus = newValue >= maxValue ? 'completed' : 'pending';
        
        const result = await pool.query(
          'UPDATE habits SET value = $1, status = $2 WHERE id = $3 RETURNING *',
          [newValue, newStatus, id]
        );
        
        const updatedHabit = result.rows[0];
        if (!updatedHabit) return null;
        
        return {
          ...updatedHabit,
          isActiveToday: isHabitActiveToday(updatedHabit)
        };
      } catch (error) {
        console.error('Error in decrementHabit:', error);
        throw error;
      }
    },
    
    async deleteHabit(id) {
      try {
        const result = await pool.query(
          'DELETE FROM habits WHERE id = $1 RETURNING *',
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error('Error in deleteHabit:', error);
        throw error;
      }
    },
    
    // Note methods
    async getNotes() {
      try {
        const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
        return result.rows;
      } catch (error) {
        console.error('Error in getNotes:', error);
        throw error;
      }
    },
    
    async getNoteByCategory(category) {
      try {
        console.log(`Fetching note for category: ${category}`);
        const result = await pool.query(
          'SELECT * FROM notes WHERE LOWER(category) = LOWER($1)',
          [category]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error(`Error in getNoteByCategory for ${category}:`, error);
        throw error;
      }
    },
    
    async getNoteById(id) {
      try {
        const result = await pool.query(
          'SELECT * FROM notes WHERE id = $1',
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in getNoteById:', error);
        throw error;
      }
    },
    
    async createNote(noteData) {
      try {
        // Check if note with this category already exists
        const existingNote = await this.getNoteByCategory(noteData.category);
        
        if (existingNote) {
          // Update existing note
          return await this.updateNote(existingNote.id, {
            content: noteData.content
          });
        }
        
        // Create new note if none exists
        const result = await pool.query(
          'INSERT INTO notes (category, content, created_at) VALUES ($1, $2, $3) RETURNING *',
          [
            noteData.category,
            noteData.content,
            noteData.createdAt || new Date().toISOString()
          ]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error in createNote:', error);
        throw error;
      }
    },
    
    async updateNote(id, noteData) {
      try {
        // Build the SET part of the query dynamically based on what's provided
        const updates = [];
        const values = [];
        
        if ('category' in noteData) {
          updates.push(`category = $${updates.length + 1}`);
          values.push(noteData.category);
        }
        
        if ('content' in noteData) {
          updates.push(`content = $${updates.length + 1}`);
          values.push(noteData.content);
        }
        
        // If there's nothing to update, return null
        if (updates.length === 0) return null;
        
        // Add the ID as the last parameter
        values.push(id);
        
        const query = `
          UPDATE notes
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING *
        `;
        
        const result = await pool.query(query, values);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in updateNote:', error);
        throw error;
      }
    },
    
    async deleteNote(id) {
      try {
        const result = await pool.query(
          'DELETE FROM notes WHERE id = $1 RETURNING *',
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error('Error in deleteNote:', error);
        throw error;
      }
    },
    
    // Daily data logging
    async logDailyData(dateStr, resetHabits = true) {
      if (resetHabits) {
        try {
          // Reset all boolean habits to pending
          await pool.query(
            "UPDATE habits SET status = 'pending' WHERE type = 'boolean'"
          );
          
          // Reset all counter habits to 0
          await pool.query(
            "UPDATE habits SET value = 0, status = 'pending' WHERE type = 'counter'"
          );
          
          return true;
        } catch (error) {
          console.error('Error in logDailyData:', error);
          throw error;
        }
      }
      return true;
    },
    
    // Settings
    async getDayStartTime() {
      try {
        console.log('[PG-ADAPTER] getDayStartTime called');
        // Try to get from settings table, falling back to default
        const query = `
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        `;
        
        try {
          await pool.query(query);
          console.log('[PG-ADAPTER] Created settings table if not exists');
        } catch (e) {
          console.error('[PG-ADAPTER] Error creating settings table:', e.message);
        }
        
        try {
          const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['dayStartTime']);
          if (result.rows.length > 0) {
            console.log('[PG-ADAPTER] Retrieved day start time from database:', result.rows[0].value);
            return result.rows[0].value;
          }
          console.log('[PG-ADAPTER] No day start time in database, using default');
          return '04:00'; // Default to 4 AM
        } catch (e) {
          console.error('[PG-ADAPTER] Error fetching day start time:', e.message);
          return '04:00'; // Default value
        }
      } catch (error) {
        console.error('[PG-ADAPTER] Error in getDayStartTime:', error);
        return '04:00'; // Default value
      }
    },
    
    async setDayStartTime(time) {
      try {
        console.log('[PG-ADAPTER] setDayStartTime called with:', time);
        // Ensure the settings table exists
        const createTable = `
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        `;
        
        await pool.query(createTable);
        
        // Upsert the day start time
        const query = `
          INSERT INTO settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE
          SET value = $2
          RETURNING value;
        `;
        
        const result = await pool.query(query, ['dayStartTime', time]);
        console.log('[PG-ADAPTER] Updated day start time in database:', result.rows[0].value);
        return result.rows[0].value;
      } catch (error) {
        console.error('[PG-ADAPTER] Error in setDayStartTime:', error);
        return time; // Return the input value as fallback
      }
    }
  };
};

// Helper function to determine if a habit is active today
function isHabitActiveToday(habit) {
  if (!habit.repeat_type) return true;
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (habit.repeat_type === 'daily') {
    // For daily habits, check if it should repeat every day or only on specific days
    if (habit.repeat_days === '*') return true;
    
    // Convert repeat_days to array if it's a string
    const repeatDays = typeof habit.repeat_days === 'string' 
      ? habit.repeat_days.split(',') 
      : habit.repeat_days;
    
    // Check if today's day is included in the repeat days
    return repeatDays.includes(dayOfWeek.toString());
  }
  
  if (habit.repeat_type === 'weekly') {
    // For weekly habits, check if it should repeat on this day of the week
    if (habit.repeat_days === '*') return true;
    
    // Convert repeat_days to array if it's a string
    const repeatDays = typeof habit.repeat_days === 'string' 
      ? habit.repeat_days.split(',') 
      : habit.repeat_days;
    
    // Check if today's day is included in the repeat days
    return repeatDays.includes(dayOfWeek.toString());
  }
  
  return true;
}

// Create and export the storage instance
export const pgStorage = createPgStorage();