export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string; // ISO date string
}

export interface Habit {
  id: number;
  name: string;
  type: 'boolean' | 'counter';
  value?: number;
  maxValue?: number;
  status?: 'completed' | 'failed';
  repeatType: 'daily' | 'weekly';
  repeatDays: string; // Comma-separated days (1=Monday, 7=Sunday)
  lastReset?: string; // ISO date string
  
  // Computed property to determine if habit is active today
  isActiveToday?: boolean;
}

export interface Note {
  id: number;
  category: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
