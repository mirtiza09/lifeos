import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  habits, type Habit, type InsertHabit,
  notes, type Note, type InsertNote
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPasscode(passcode: string): Promise<boolean>;
  setPasscode(passcode: string): Promise<boolean>;
  hasPasscodeSetup(): Promise<boolean>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Habit methods
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  completeHabit(id: number): Promise<Habit | undefined>;
  failHabit(id: number): Promise<Habit | undefined>;
  resetHabitStatus(id: number): Promise<Habit | undefined>;
  incrementHabit(id: number): Promise<Habit | undefined>;
  decrementHabit(id: number): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Note methods
  getNotes(): Promise<Note[]>;
  getNoteByCategory(category: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
}

// Define storage file paths
const DATA_DIR = './data';
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const HABITS_FILE = path.join(DATA_DIR, 'habits.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const DAILY_LOGS_DIR = path.join(LOGS_DIR, 'daily');

// Helper type for storing counters
interface Counters {
  userCurrentId: number;
  taskCurrentId: number;
  habitCurrentId: number;
  noteCurrentId: number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private habits: Map<number, Habit>;
  private notes: Map<number, Note>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private habitCurrentId: number;
  private noteCurrentId: number;
  private dataDir: string;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.tasks = new Map();
    this.habits = new Map();
    this.notes = new Map();
    
    // Initialize counters
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.habitCurrentId = 1;
    this.noteCurrentId = 1;
    this.dataDir = DATA_DIR;
    
    // Ensure data directory exists
    this.ensureDataDir();
    
    // Load data from files if they exist, otherwise initialize with defaults
    if (this.loadFromFiles()) {
      console.log('Data loaded from files successfully');
      
      // Check if we have a user with a passcode set, if not set the default one
      this.hasPasscodeSetup().then(hasPasscode => {
        if (!hasPasscode) {
          // Use environment variable for default passcode, fallback to "6969" if not defined
          const defaultPasscode = process.env.DEFAULT_PASSCODE || '6969';
          console.log(`No passcode found, setting default passcode to "${defaultPasscode}"`);
          this.setPasscode(defaultPasscode).then(() => {
            console.log('Default passcode set successfully');
          });
        }
      });
    } else {
      console.log('No existing data files found, initializing with defaults');
      this.initializeDefaultData();
      
      // Set the default passcode using environment variable
      const defaultPasscode = process.env.DEFAULT_PASSCODE || '6969';
      console.log(`Setting default passcode to "${defaultPasscode}"`);
      this.setPasscode(defaultPasscode).then(() => {
        console.log('Default passcode set successfully');
      });
      
      this.saveToFiles(); // Save default data to files
    }
  }
  
  // Ensure the data directory exists
  private ensureDataDir(): void {
    try {
      // Create main data directory if it doesn't exist
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        console.log(`Created data directory: ${this.dataDir}`);
      }
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
        console.log(`Created logs directory: ${LOGS_DIR}`);
      }
      
      // Create daily logs directory if it doesn't exist
      if (!fs.existsSync(DAILY_LOGS_DIR)) {
        fs.mkdirSync(DAILY_LOGS_DIR, { recursive: true });
        console.log(`Created daily logs directory: ${DAILY_LOGS_DIR}`);
      }
    } catch (error) {
      console.error('Error ensuring data directory exists:', error);
    }
  }
  
  // Log today's data for reporting and reset habits
  public logDailyData(dateStr?: string, resetHabits: boolean = true): void {
    try {
      const date = dateStr ? new Date(dateStr) : new Date();
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Create daily log directory with date if it doesn't exist
      const dailyLogDir = path.join(DAILY_LOGS_DIR, formattedDate);
      if (!fs.existsSync(dailyLogDir)) {
        fs.mkdirSync(dailyLogDir, { recursive: true });
      }
      
      // Log tasks
      const completedTasks = Array.from(this.tasks.values()).filter(task => task.completed);
      const pendingTasks = Array.from(this.tasks.values()).filter(task => !task.completed);
      
      const tasksLog = {
        date: date.toISOString(),
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: completedTasks.length / Math.max(1, this.tasks.size) // Avoid division by zero
      };
      
      fs.writeFileSync(
        path.join(dailyLogDir, 'tasks.json'),
        JSON.stringify(tasksLog, null, 2)
      );
      
      // Log habits
      const habits = Array.from(this.habits.values());
      const habitsWithActiveStatus = habits.map(habit => ({
        ...habit,
        isActiveToday: this.isHabitActiveToday(habit)
      }));
      
      const completedHabits = habitsWithActiveStatus.filter(habit => 
        (habit.type === 'boolean' && habit.status === 'completed') || 
        (habit.type === 'counter' && habit.value !== null && habit.value > 0 && 
         habit.maxValue !== null && habit.value >= habit.maxValue)
      );
      
      const failedHabits = habitsWithActiveStatus.filter(habit => 
        (habit.type === 'boolean' && habit.status === 'failed') || 
        (habit.isActiveToday && habit.type === 'counter' && 
          ((habit.value === 0 || habit.value === null) || 
           (habit.maxValue !== null && habit.value !== null && habit.value < habit.maxValue)))
      );
      
      const habitsLog = {
        date: date.toISOString(),
        completed: completedHabits,
        failed: failedHabits,
        all: habitsWithActiveStatus,
        completionRate: completedHabits.length / Math.max(1, habitsWithActiveStatus.filter(h => h.isActiveToday).length)
      };
      
      fs.writeFileSync(
        path.join(dailyLogDir, 'habits.json'),
        JSON.stringify(habitsLog, null, 2)
      );
      
      console.log(`Daily data logged successfully for ${formattedDate}`);
      
      // Reset habits if requested
      if (resetHabits) {
        this.resetHabits(date);
      }
    } catch (error) {
      console.error('Error logging daily data:', error);
    }
  }
  
  // Reset all habits for a new day
  private resetHabits(date: Date): void {
    try {
      const now = date || new Date();
      const resetTime = now.toISOString();
      let habitCount = 0;
      
      // Go through all habits and reset counters and statuses
      Array.from(this.habits.values()).forEach(habit => {
        let updated = false;
        const updatedHabit = { ...habit };
        
        // Reset counter values to 0
        if (habit.type === 'counter') {
          updatedHabit.value = 0;
          updated = true;
        }
        
        // Reset boolean habit statuses to null
        if (habit.type === 'boolean') {
          updatedHabit.status = null;
          updated = true;
        }
        
        // Update the lastReset time
        updatedHabit.lastReset = resetTime;
        
        // Save the updated habit
        if (updated) {
          this.habits.set(habit.id, updatedHabit);
          habitCount++;
        }
      });
      
      // Save all the reset habits to files
      this.saveToFiles();
      
      console.log(`Reset ${habitCount} habits at ${resetTime}`);
    } catch (error) {
      console.error('Error resetting habits:', error);
    }
  }
  
  // Save data to JSON files
  private saveToFiles(): void {
    try {
      // Save tasks
      const tasksData = Array.from(this.tasks.values());
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2));
      
      // Save habits
      const habitsData = Array.from(this.habits.values());
      fs.writeFileSync(HABITS_FILE, JSON.stringify(habitsData, null, 2));
      
      // Save notes
      const notesData = Array.from(this.notes.values());
      fs.writeFileSync(NOTES_FILE, JSON.stringify(notesData, null, 2));
      
      // Save counters
      const counters: Counters = {
        userCurrentId: this.userCurrentId,
        taskCurrentId: this.taskCurrentId,
        habitCurrentId: this.habitCurrentId,
        noteCurrentId: this.noteCurrentId
      };
      fs.writeFileSync(COUNTERS_FILE, JSON.stringify(counters, null, 2));
      
      console.log('Data saved to files successfully');
    } catch (error) {
      console.error('Error saving data to files:', error);
    }
  }
  
  // Load data from JSON files
  private loadFromFiles(): boolean {
    try {
      let loaded = false;
      
      // Load tasks if file exists
      if (fs.existsSync(TASKS_FILE)) {
        const tasksData = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8')) as Task[];
        this.tasks = new Map(tasksData.map(task => [task.id, task]));
        loaded = true;
      }
      
      // Load habits if file exists
      if (fs.existsSync(HABITS_FILE)) {
        const habitsData = JSON.parse(fs.readFileSync(HABITS_FILE, 'utf8')) as Habit[];
        this.habits = new Map(habitsData.map(habit => [habit.id, habit]));
        loaded = true;
      }
      
      // Load notes if file exists
      if (fs.existsSync(NOTES_FILE)) {
        const notesData = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8')) as Note[];
        this.notes = new Map(notesData.map(note => [note.id, note]));
        loaded = true;
      }
      
      // Load counters if file exists
      if (fs.existsSync(COUNTERS_FILE)) {
        const counters = JSON.parse(fs.readFileSync(COUNTERS_FILE, 'utf8')) as Counters;
        this.userCurrentId = counters.userCurrentId;
        this.taskCurrentId = counters.taskCurrentId;
        this.habitCurrentId = counters.habitCurrentId;
        this.noteCurrentId = counters.noteCurrentId || 1; // Default to 1 if not present in older data files
      }
      
      return loaded;
    } catch (error) {
      console.error('Error loading data from files:', error);
      return false;
    }
  }

  private initializeDefaultData() {
    // Default tasks
    const defaultTasks = [
      { text: "Buy Shampoo + Laundry + Tissues + Supplement", completed: false },
      { text: "Do Laundry", completed: false },
      { text: "Website Finalise", completed: false },
      { text: "Buy Nailcutter", completed: false },
    ];
    
    // Default habits
    const defaultHabits = [
      { 
        name: "One", 
        type: "boolean", 
        status: undefined, 
        repeatType: "daily", 
        repeatDays: "1,2,3,4,5,6,7" 
      },
      { 
        name: "Namaz", 
        type: "counter", 
        value: 0, 
        maxValue: 5, 
        repeatType: "daily", 
        repeatDays: "1,2,3,4,5,6,7" 
      },
      { 
        name: "Conscious Eating", 
        type: "boolean", 
        status: undefined, 
        repeatType: "daily", 
        repeatDays: "1,2,3,4,5,6,7" 
      },
      { 
        name: "Exercise", 
        type: "boolean", 
        status: undefined, 
        repeatType: "weekly", 
        repeatDays: "1,3,5" 
      },
    ];
    
    // Add default tasks
    defaultTasks.forEach(task => {
      this.createTask({
        text: task.text,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        userId: null,
      });
    });
    
    // Add default habits
    defaultHabits.forEach(habit => {
      this.createHabit({
        name: habit.name,
        type: habit.type,
        value: habit.type === "counter" ? 0 : undefined,
        maxValue: habit.maxValue,
        status: habit.status,
        repeatType: habit.repeatType,
        repeatDays: habit.repeatDays,
        userId: null,
        lastReset: new Date().toISOString(),
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Ensure we have proper types for the user object
    const user: User = { 
      ...insertUser, 
      id,
      hashedPasscode: insertUser.hashedPasscode || null 
    };
    this.users.set(id, user);
    this.saveToFiles(); // Save changes to files
    return user;
  }
  
  // Simple hashing function for the passcode (in a real app, use a more secure method)
  private hashPasscode(passcode: string): string {
    // Simple hash for demo purposes only, in production use a proper library like bcrypt
    let hash = 0;
    for (let i = 0; i < passcode.length; i++) {
      const char = passcode.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }
  
  async verifyPasscode(passcode: string): Promise<boolean> {
    // Check if any user has the passcode (for simplicity we're using a global passcode)
    // In a real multi-user system, you'd verify based on the current user
    const users = Array.from(this.users.values());
    
    // If no users exist yet, allow setting the passcode
    if (users.length === 0) {
      return false;
    }
    
    // Find any user with the hashed passcode
    const hashedInput = this.hashPasscode(passcode);
    const userWithPasscode = users.find(user => user.hashedPasscode === hashedInput);
    
    return !!userWithPasscode;
  }
  
  async hasPasscodeSetup(): Promise<boolean> {
    // Check if any user has a hashedPasscode set
    const users = Array.from(this.users.values());
    return users.some(user => user.hashedPasscode !== null && user.hashedPasscode !== undefined);
  }
  
  async setPasscode(passcode: string): Promise<boolean> {
    try {
      // For simplicity, we'll set the passcode on the first user or create a new user
      let targetUser: User;
      
      const users = Array.from(this.users.values());
      if (users.length > 0) {
        targetUser = users[0];
        targetUser.hashedPasscode = this.hashPasscode(passcode);
        this.users.set(targetUser.id, targetUser);
      } else {
        // Create a default user with the passcode
        targetUser = await this.createUser({
          username: 'default',
          password: 'default', // This is just a placeholder as we're moving to passcode
          hashedPasscode: this.hashPasscode(passcode)
        });
      }
      
      this.saveToFiles(); // Save changes to files
      return true;
    } catch (error) {
      console.error('Error setting passcode:', error);
      return false;
    }
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    // Ensure completed has a default value if not provided and add creation timestamp
    const task: Task = { 
      ...insertTask, 
      id,
      completed: insertTask.completed ?? false,
      createdAt: insertTask.createdAt ?? new Date().toISOString(),
      userId: insertTask.userId ?? null
    };
    this.tasks.set(id, task);
    this.saveToFiles(); // Save changes to files
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    this.saveToFiles(); // Save changes to files
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = this.tasks.delete(id);
    if (result) {
      this.saveToFiles(); // Save changes to files
    }
    return result;
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
    const habits = Array.from(this.habits.values());
    
    // Add computed property isActiveToday
    return habits.map(habit => ({
      ...habit,
      isActiveToday: this.isHabitActiveToday(habit)
    }));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitCurrentId++;
    
    // Ensure all required fields have default values
    const habit: Habit = { 
      ...insertHabit, 
      id,
      status: insertHabit.status ?? null,
      value: insertHabit.value ?? 0,
      userId: insertHabit.userId ?? null,
      maxValue: insertHabit.maxValue ?? null,
      repeatType: insertHabit.repeatType ?? 'daily',
      repeatDays: insertHabit.repeatDays ?? '1,2,3,4,5,6,7',
      lastReset: insertHabit.lastReset ?? null
    };
    
    this.habits.set(id, habit);
    this.saveToFiles(); // Save changes to files
    return habit;
  }

  async updateHabit(id: number, habitUpdate: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) {
      console.error(`Habit with ID ${id} not found for update`);
      return undefined;
    }
    
    console.log(`Updating habit #${id} "${habit.name}" with data:`, habitUpdate);
    
    // Create updated habit object with merged properties
    const updatedHabit = { ...habit, ...habitUpdate };
    
    // Store the updated habit
    this.habits.set(id, updatedHabit);
    
    // Save changes to files
    this.saveToFiles();
    
    console.log(`Habit #${id} updated successfully:`, updatedHabit);
    return updatedHabit;
  }

  async completeHabit(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.type !== "boolean") return undefined;
    
    const updatedHabit = { ...habit, status: "completed" };
    this.habits.set(id, updatedHabit);
    this.saveToFiles(); // Save changes to files
    return updatedHabit;
  }

  async failHabit(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.type !== "boolean") return undefined;
    
    const updatedHabit = { ...habit, status: "failed" };
    this.habits.set(id, updatedHabit);
    this.saveToFiles(); // Save changes to files
    return updatedHabit;
  }

  async resetHabitStatus(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.type !== "boolean") return undefined;
    
    const updatedHabit = { ...habit, status: null };
    this.habits.set(id, updatedHabit);
    this.saveToFiles(); // Save changes to files
    return updatedHabit;
  }

  async incrementHabit(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.type !== "counter") return undefined;
    
    const currentValue = habit.value || 0;
    const updatedHabit = { ...habit, value: currentValue + 1 };
    this.habits.set(id, updatedHabit);
    this.saveToFiles(); // Save changes to files
    return updatedHabit;
  }

  async decrementHabit(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.type !== "counter") return undefined;
    
    const currentValue = habit.value || 0;
    const updatedHabit = { ...habit, value: Math.max(0, currentValue - 1) };
    this.habits.set(id, updatedHabit);
    this.saveToFiles(); // Save changes to files
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = this.habits.delete(id);
    if (result) {
      this.saveToFiles(); // Save changes to files
    }
    return result;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNoteByCategory(category: string): Promise<Note | undefined> {
    return Array.from(this.notes.values()).find(
      (note) => note.category === category
    );
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    
    // Ensure all required fields have default values
    const note: Note = { 
      ...insertNote, 
      id,
      content: insertNote.content ?? '',
      updatedAt: insertNote.updatedAt ?? new Date().toISOString(),
      userId: insertNote.userId ?? null
    };
    
    this.notes.set(id, note);
    this.saveToFiles(); // Save changes to files
    return note;
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) {
      console.error(`Note with ID ${id} not found for update`);
      return undefined;
    }
    
    // Create updated note object with merged properties
    const updatedNote = { 
      ...note, 
      ...noteUpdate,
      updatedAt: new Date().toISOString()  // Always update the timestamp on updates
    };
    
    // Store the updated note
    this.notes.set(id, updatedNote);
    
    // Save changes to files
    this.saveToFiles();
    
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = this.notes.delete(id);
    if (result) {
      this.saveToFiles(); // Save changes to files
    }
    return result;
  }
}

export const storage = new MemStorage();
