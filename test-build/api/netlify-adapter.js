/**
 * Netlify Functions Storage Adapter (Modern Netlify Functions Compatible)
 * 
 * In-memory storage implementation specifically optimized for Netlify's serverless environment.
 * This adapter is designed to work with the modern Netlify Functions API and provides:
 * 
 * 1. Persistent in-memory storage across function invocations (within the same function instance)
 * 2. Compatibility with Netlify's read-only filesystem
 * 3. Automatic initialization with default data
 * 4. Complete implementation of the storage interface
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

// In-memory storage maps
const tasksMap = new Map();
const habitsMap = new Map();
const notesMap = new Map();
const userMap = new Map();

// Counter for generating IDs
let taskCurrentId = 1;
let habitCurrentId = 1;
let noteCurrentId = 1;
let userCurrentId = 1;

// Day start time setting
const DEFAULT_DAY_START_TIME = '04:00'; // 4 AM default
let dayStartTime = DEFAULT_DAY_START_TIME;

// Factory function to create a storage instance
export const createServerlessStorage = () => {
  // Initialize with default data
  if (tasksMap.size === 0 && habitsMap.size === 0 && notesMap.size === 0) {
    initializeDefaultData();
  }
  
  return {
    // User methods
    async getUser(id) {
      return userMap.get(id) || null;
    },
    
    async getUserByUsername(username) {
      // Find the user with the given username
      for (const user of userMap.values()) {
        if (user.username.toLowerCase() === username.toLowerCase()) {
          return user;
        }
      }
      return null;
    },
    
    async createUser(userData) {
      const id = userCurrentId++;
      const user = { 
        ...userData, 
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      userMap.set(id, user);
      return user;
    },
    
    // Task methods
    async getTasks() {
      return Array.from(tasksMap.values()).sort((a, b) => {
        // Completed tasks should appear after non-completed tasks
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    
    async getTask(id) {
      return tasksMap.get(id) || null;
    },
    
    async createTask(taskData) {
      const id = taskCurrentId++;
      const task = { 
        ...taskData, 
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasksMap.set(id, task);
      return task;
    },
    
    async updateTask(id, taskData) {
      const task = tasksMap.get(id);
      if (!task) return null;
      
      const updatedTask = { 
        ...task, 
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      tasksMap.set(id, updatedTask);
      return updatedTask;
    },
    
    async deleteTask(id) {
      const task = tasksMap.get(id);
      if (!task) return false;
      
      tasksMap.delete(id);
      return true;
    },
    
    // Habit methods
    async getHabits() {
      const now = new Date();
      const habitsArray = Array.from(habitsMap.values());
      
      // Add isActiveToday field to each habit
      return habitsArray.map(habit => ({
        ...habit,
        isActiveToday: isHabitActiveToday(habit)
      }));
    },
    
    async getHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit) return null;
      
      return {
        ...habit,
        isActiveToday: isHabitActiveToday(habit)
      };
    },
    
    async createHabit(habitData) {
      const id = habitCurrentId++;
      const habit = { 
        ...habitData, 
        id,
        status: 'pending', // 'pending', 'completed', 'failed'
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, habit);
      return {
        ...habit,
        isActiveToday: isHabitActiveToday(habit)
      };
    },
    
    async updateHabit(id, habitData) {
      const habit = habitsMap.get(id);
      if (!habit) return null;
      
      const updatedHabit = { 
        ...habit, 
        ...habitData,
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async completeHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit) return null;
      
      const updatedHabit = { 
        ...habit, 
        status: 'completed',
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async failHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit) return null;
      
      const updatedHabit = { 
        ...habit, 
        status: 'failed',
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async resetHabitStatus(id) {
      const habit = habitsMap.get(id);
      if (!habit) return null;
      
      const updatedHabit = { 
        ...habit, 
        status: 'pending',
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async incrementHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit || habit.type !== 'counter') return null;
      
      const currentValue = typeof habit.currentValue === 'number' ? habit.currentValue : 0;
      const maxValue = typeof habit.maxValue === 'number' ? habit.maxValue : Infinity;
      const newValue = Math.min(currentValue + 1, maxValue);
      
      const status = newValue >= maxValue ? 'completed' : 'pending';
      
      const updatedHabit = { 
        ...habit, 
        currentValue: newValue,
        status,
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async decrementHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit || habit.type !== 'counter') return null;
      
      const currentValue = typeof habit.currentValue === 'number' ? habit.currentValue : 0;
      const newValue = Math.max(currentValue - 1, 0);
      
      const maxValue = typeof habit.maxValue === 'number' ? habit.maxValue : Infinity;
      const status = newValue >= maxValue ? 'completed' : 'pending';
      
      const updatedHabit = { 
        ...habit, 
        currentValue: newValue,
        status,
        updatedAt: new Date().toISOString()
      };
      
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    
    async deleteHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit) return false;
      
      habitsMap.delete(id);
      return true;
    },
    
    // Note methods
    async getNotes() {
      return Array.from(notesMap.values()).sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    
    async getNoteByCategory(category) {
      // Find the note with the given category (case-insensitive)
      for (const note of notesMap.values()) {
        if (note.category.toLowerCase() === category.toLowerCase()) {
          return note;
        }
      }
      return null;
    },
    
    async createNote(noteData) {
      const id = noteCurrentId++;
      const note = { 
        ...noteData, 
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      notesMap.set(id, note);
      return note;
    },
    
    async updateNote(id, noteData) {
      const note = notesMap.get(id);
      if (!note) return null;
      
      const updatedNote = { 
        ...note, 
        ...noteData,
        updatedAt: new Date().toISOString()
      };
      
      notesMap.set(id, updatedNote);
      return updatedNote;
    },
    
    async getNoteById(id) {
      return notesMap.get(id) || null;
    },
    
    async deleteNote(id) {
      const note = notesMap.get(id);
      if (!note) return false;
      
      notesMap.delete(id);
      return true;
    },
    
    // Settings
    async getDayStartTime() {
      return dayStartTime || DEFAULT_DAY_START_TIME;
    },
    
    async setDayStartTime(time) {
      dayStartTime = time;
      return dayStartTime;
    },
    
    // Daily data logging
    async logDailyData(dateStr, resetHabits = true) {
      if (resetHabits) {
        // Reset all boolean habits to pending
        for (const [id, habit] of habitsMap.entries()) {
          if (habit.type === 'boolean' && habit.status !== 'pending') {
            habitsMap.set(id, {
              ...habit,
              status: 'pending',
              updatedAt: new Date().toISOString()
            });
          }
          
          // Reset all counter habits to 0
          if (habit.type === 'counter') {
            habitsMap.set(id, {
              ...habit,
              currentValue: 0,
              status: 'pending',
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
      
      return true;
    }
  };
};

// Helper function to determine if a habit is active on a given day
function isHabitActiveToday(habit) {
  if (!habit.repeatType) return true;
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (habit.repeatType === 'daily') {
    // For daily habits, check if it should repeat every day or only on specific days
    if (habit.repeatDays === '*') return true;
    
    // Check if today's day is included in the repeat days
    return habit.repeatDays.includes(dayOfWeek.toString());
  }
  
  if (habit.repeatType === 'weekly') {
    // For weekly habits, check if it should repeat on this day of the week
    if (habit.repeatDays === '*') return true;
    
    // Check if today's day is included in the repeat days
    return habit.repeatDays.includes(dayOfWeek.toString());
  }
  
  return true;
}

// Initialize with some example data
function initializeDefaultData() {
  // Create some default habits
  const habit1 = {
    id: habitCurrentId++,
    name: 'Morning Exercise',
    type: 'boolean',
    repeatType: 'daily',
    repeatDays: '*',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const habit2 = {
    id: habitCurrentId++,
    name: 'Drink water',
    type: 'counter',
    maxValue: 8,
    currentValue: 0,
    repeatType: 'daily',
    repeatDays: '*',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  habitsMap.set(habit1.id, habit1);
  habitsMap.set(habit2.id, habit2);
  
  // Create default task
  const task = {
    id: taskCurrentId++,
    text: 'Create project plan',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasksMap.set(task.id, task);
  
  // Create default notes
  const note1 = {
    id: noteCurrentId++,
    category: 'Health',
    content: '# Health Goals\n\n- Improve sleep schedule\n- Drink more water\n- Exercise 3 times a week',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const note2 = {
    id: noteCurrentId++,
    category: 'Career',
    content: '# Career Notes\n\n- Update resume\n- Network with industry professionals\n- Learn new skills',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const note3 = {
    id: noteCurrentId++,
    category: 'Finances',
    content: '# Financial Goals\n\n- Save 20% of income\n- Review budget monthly\n- Research investment options',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const note4 = {
    id: noteCurrentId++,
    category: 'Personal',
    content: '# Personal Development\n\n- Read one book per month\n- Practice meditation\n- Spend quality time with family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notesMap.set(note1.id, note1);
  notesMap.set(note2.id, note2);
  notesMap.set(note3.id, note3);
  notesMap.set(note4.id, note4);
}

// Export the netlify storage singleton
export const netlifyStorage = createServerlessStorage();