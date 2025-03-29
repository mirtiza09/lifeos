import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  habits, type Habit, type InsertHabit,
  notes, type Note, type InsertNote
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
    
    console.log(`Checking habit "${habit.name}": day=${dayOfWeek}, formattedDay=${formattedDay}, repeatDays=${habit.repeatDays}`);
    
    if (habit.repeatType === 'daily') {
      console.log(`Habit "${habit.name}" is daily -> true`);
      return true;
    } else if (habit.repeatType === 'weekly' && habit.repeatDays) {
      const isActive = habit.repeatDays.split(',').includes(formattedDay.toString());
      console.log(`Habit "${habit.name}" is weekly, checking if ${formattedDay} is in [${habit.repeatDays}] -> ${isActive}`);
      return isActive;
    }
    
    console.log(`Habit "${habit.name}" doesn't match any conditions -> false`);
    return false;
  }

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    const habitsResult = await this.db.select().from(habits);
    
    // Add computed property isActiveToday
    return habitsResult.map((habit: Habit) => ({
      ...habit,
      isActiveToday: this.isHabitActiveToday(habit)
    }));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const result = await this.db.select().from(habits).where(eq(habits.id, id));
    return result[0];
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

  // Method to log daily data - for compatibility with the old interface
  public logDailyData(dateStr?: string, resetHabits: boolean = true): void {
    if (resetHabits) {
      // We'll handle this by resetting habits directly in the database
      this.resetAllHabits();
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