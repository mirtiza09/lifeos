import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  habits, type Habit, type InsertHabit,
  notes, type Note, type InsertNote,
  dailyAnalytics, type DailyAnalytics, type InsertDailyAnalytics
} from "@shared/schema";
import { IStorage } from "./storage";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon, neonConfig } from '@neondatabase/serverless';

export class PgStorage implements IStorage {
  private db: NeonHttpDatabase;
  
  constructor() {
    // Get database URL from environment variable
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Configure Neon for serverless environments
    neonConfig.fetchConnectionCache = true;

    // Create a Neon client
    const sql = neon(databaseUrl);
    
    // Create a drizzle instance
    this.db = drizzle(sql);
    
    console.log('PostgreSQL database connection established');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return await this.db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await this.db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.db.update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await this.db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Helper method to check if a habit is active today
  private isHabitActiveToday(habit: Habit): boolean {
    const today = new Date();
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    // Convert to our format (1 = Monday, 7 = Sunday)
    const formattedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    if (habit.repeatType === 'daily') {
      return true;
    } else if (habit.repeatType === 'weekly' && habit.repeatDays) {
      return habit.repeatDays.split(',').includes(formattedDay.toString());
    }
    
    return false;
  }
  
  // This extends the Habit type with additional computed properties
  private extendHabit(habit: Habit): Habit & { isActiveToday: boolean } {
    return {
      ...habit,
      isActiveToday: this.isHabitActiveToday(habit)
    };
  }

  // Habit methods
  async getHabits(): Promise<(Habit & { isActiveToday: boolean })[]> {
    const habitsResult = await this.db.select().from(habits);
    
    // Add computed property isActiveToday
    return habitsResult.map((habit: Habit) => ({
      ...habit,
      isActiveToday: this.isHabitActiveToday(habit)
    }));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const result = await this.db.select().from(habits).where(eq(habits.id, id));
    if (result[0]) {
      return this.extendHabit(result[0]);
    }
    return undefined;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const result = await this.db.insert(habits).values(habit).returning();
    return result[0];
  }

  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const result = await this.db.update(habits)
      .set(habit)
      .where(eq(habits.id, id))
      .returning();
    return result[0];
  }

  async completeHabit(id: number): Promise<Habit | undefined> {
    // Get current habit
    const currentHabit = await this.getHabit(id);
    if (!currentHabit || currentHabit.type !== 'boolean') {
      return undefined;
    }
    
    return this.updateHabit(id, { status: 'completed' });
  }

  async failHabit(id: number): Promise<Habit | undefined> {
    // Get current habit
    const currentHabit = await this.getHabit(id);
    if (!currentHabit || currentHabit.type !== 'boolean') {
      return undefined;
    }
    
    return this.updateHabit(id, { status: 'failed' });
  }

  async resetHabitStatus(id: number): Promise<Habit | undefined> {
    // Get current habit
    const currentHabit = await this.getHabit(id);
    if (!currentHabit) {
      return undefined;
    }
    
    if (currentHabit.type === 'boolean') {
      return this.updateHabit(id, { status: null });
    } else if (currentHabit.type === 'counter') {
      return this.updateHabit(id, { value: 0 });
    }
    
    return currentHabit;
  }

  async incrementHabit(id: number): Promise<Habit | undefined> {
    // Get current habit
    const currentHabit = await this.getHabit(id);
    if (!currentHabit || currentHabit.type !== 'counter') {
      return undefined;
    }
    
    const currentValue = currentHabit.value || 0;
    return this.updateHabit(id, { value: currentValue + 1 });
  }

  async decrementHabit(id: number): Promise<Habit | undefined> {
    // Get current habit
    const currentHabit = await this.getHabit(id);
    if (!currentHabit || currentHabit.type !== 'counter') {
      return undefined;
    }
    
    const currentValue = currentHabit.value || 0;
    const newValue = Math.max(0, currentValue - 1); // Prevent negative values
    return this.updateHabit(id, { value: newValue });
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await this.db.delete(habits).where(eq(habits.id, id)).returning();
    return result.length > 0;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return await this.db.select().from(notes);
  }

  async getNoteByCategory(category: string): Promise<Note | undefined> {
    const result = await this.db.select().from(notes).where(eq(notes.category, category));
    return result[0];
  }

  async createNote(note: InsertNote): Promise<Note> {
    const result = await this.db.insert(notes).values(note).returning();
    return result[0];
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const result = await this.db.update(notes)
      .set(note)
      .where(eq(notes.id, id))
      .returning();
    return result[0];
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await this.db.delete(notes).where(eq(notes.id, id)).returning();
    return result.length > 0;
  }

  // Analytics methods
  async getDailyAnalytics(date: string): Promise<DailyAnalytics | undefined> {
    const result = await this.db.select().from(dailyAnalytics).where(eq(dailyAnalytics.date, date));
    return result[0];
  }

  async getDailyAnalyticsRange(startDate: string, endDate: string): Promise<DailyAnalytics[]> {
    // Using a simpler approach with SQL template literals
    const sql = neon(process.env.DATABASE_URL!);
    
    // Direct SQL query for date range with proper parameters
    const result = await sql`
      SELECT * FROM daily_analytics 
      WHERE date >= ${startDate} AND date <= ${endDate}
      ORDER BY date
    `;
    
    // Transform the database result to match our expected schema
    return result.map((row: any) => ({
      id: row.id,
      date: row.date,
      totalTasks: row.total_tasks,
      completedTasks: row.completed_tasks,
      newTasksCreated: row.new_tasks_created,
      totalHabits: row.total_habits,
      activeHabits: row.active_habits,
      completedHabits: row.completed_habits,
      failedHabits: row.failed_habits,
      counterHabitsProgress: row.counter_habits_progress,
      newHabitsCreated: row.new_habits_created,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async logDailyAnalytics(dateStr?: string): Promise<DailyAnalytics> {
    try {
      const now = new Date();
      const date = dateStr ? new Date(dateStr) : now;
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Get all tasks
      const allTasks = await this.getTasks();
      // Count tasks created today
      const todayCreatedTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === formattedDate;
      });
      
      // Get all habits with active today status
      const allHabits = await this.getHabits();
      const activeHabits = allHabits.filter(habit => habit.isActiveToday);
      
      // Count completed boolean habits
      const completedBooleanHabits = activeHabits.filter(habit => 
        habit.type === 'boolean' && habit.status === 'completed'
      );
      
      // Count failed boolean habits
      const failedBooleanHabits = activeHabits.filter(habit => 
        habit.type === 'boolean' && habit.status === 'failed'
      );
      
      // For counter habits, get their progress
      const counterHabits = activeHabits.filter(habit => habit.type === 'counter');
      const counterHabitsProgress: Record<number, { value: number, maxValue: number | null }> = {};
      
      // Track which counter habits are "completed" (value >= maxValue)
      let completedCounterHabits = 0;
      for (const habit of counterHabits) {
        counterHabitsProgress[habit.id] = {
          value: habit.value || 0,
          maxValue: habit.maxValue
        };
        
        // Count completed counter habits (where value >= maxValue)
        if (habit.maxValue !== null && habit.value !== null && habit.value >= habit.maxValue) {
          completedCounterHabits++;
        }
      }
      
      // Count habits created today
      const todayCreatedHabits = allHabits.filter(habit => {
        // Check if the habit was created today by looking at lastReset
        // This is not perfect but a reasonable approximation
        if (!habit.lastReset) return false;
        const habitDate = new Date(habit.lastReset).toISOString().split('T')[0];
        return habitDate === formattedDate;
      });
      
      // Create analytics entry
      const analytics: InsertDailyAnalytics = {
        date: formattedDate,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(task => task.completed).length,
        newTasksCreated: todayCreatedTasks.length,
        totalHabits: allHabits.length,
        activeHabits: activeHabits.length,
        completedHabits: completedBooleanHabits.length + completedCounterHabits,
        failedHabits: failedBooleanHabits.length,
        counterHabitsProgress: JSON.stringify(counterHabitsProgress),
        newHabitsCreated: todayCreatedHabits.length,
        userId: null, // If user system is implemented later
        createdAt: now.toISOString()
      };
      
      // Check if we already have an analytics entry for this date
      const existingEntry = await this.getDailyAnalytics(formattedDate);
      
      if (existingEntry) {
        // Update existing entry
        const result = await this.db.update(dailyAnalytics)
          .set(analytics)
          .where(eq(dailyAnalytics.id, existingEntry.id))
          .returning();
        return result[0];
      } else {
        // Create new entry
        const result = await this.db.insert(dailyAnalytics)
          .values(analytics)
          .returning();
        return result[0];
      }
    } catch (error) {
      console.error('Error logging daily analytics:', error);
      throw error;
    }
  }

  // Method to log daily data - for compatibility with the old interface
  // Now it also logs analytics data before resetting habits
  public async logDailyData(dateStr?: string, resetHabits: boolean = true): Promise<void> {
    try {
      // First log analytics data before resetting habits
      await this.logDailyAnalytics(dateStr);
      
      // Then reset habits if requested
      if (resetHabits) {
        await this.resetAllHabits();
      }
    } catch (error) {
      console.error('Error in logDailyData:', error);
    }
  }

  // Reset all habits for a new day
  private async resetAllHabits(): Promise<void> {
    try {
      const now = new Date();
      const resetTime = now.toISOString();
      
      // Get all habits
      const allHabits = await this.db.select().from(habits);
      
      // Reset boolean habits
      const booleanHabits = allHabits.filter((h: Habit) => h.type === 'boolean');
      for (const habit of booleanHabits) {
        await this.db.update(habits)
          .set({ status: null, lastReset: resetTime })
          .where(eq(habits.id, habit.id));
      }
      
      // Reset counter habits
      const counterHabits = allHabits.filter((h: Habit) => h.type === 'counter');
      for (const habit of counterHabits) {
        await this.db.update(habits)
          .set({ value: 0, lastReset: resetTime })
          .where(eq(habits.id, habit.id));
      }
      
      console.log(`Reset ${allHabits.length} habits at ${resetTime}`);
    } catch (error) {
      console.error('Error resetting habits:', error);
    }
  }
}