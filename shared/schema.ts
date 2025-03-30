import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tasks table for Life OS
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: text("created_at").notNull(), // ISO date string
  userId: integer("user_id").references(() => users.id), // Nullable foreign key
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  text: true,
  completed: true,
  createdAt: true,
  userId: true,
});

// Habits table for Life OS
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'boolean' or 'counter'
  value: integer("value").default(0),
  maxValue: integer("max_value"), // Maximum value for counter habits
  status: text("status"), // 'completed' or 'failed' for boolean habits
  repeatType: text("repeat_type").default("daily").notNull(), // 'daily' or 'weekly'
  repeatDays: text("repeat_days").default("1,2,3,4,5,6,7"), // Comma-separated days (1=Monday, 7=Sunday)
  userId: integer("user_id").references(() => users.id), // Nullable foreign key
  lastReset: text("last_reset"), // ISO date string of last reset
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  type: true,
  value: true,
  maxValue: true,
  status: true,
  repeatType: true,
  repeatDays: true,
  userId: true,
  lastReset: true,
});

// Notes table for Life OS
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'health', 'career', 'finances', 'personal'
  content: text("content").default(''), // Markdown content
  updatedAt: text("updated_at").notNull(), // ISO date string
  userId: integer("user_id").references(() => users.id), // Nullable foreign key
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  category: true,
  content: true,
  updatedAt: true,
  userId: true,
});

// Daily Analytics table for tracking daily performance
export const dailyAnalytics = pgTable("daily_analytics", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  
  // Task analytics
  totalTasks: integer("total_tasks").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  newTasksCreated: integer("new_tasks_created").default(0).notNull(),
  
  // Habit analytics
  totalHabits: integer("total_habits").default(0).notNull(),
  activeHabits: integer("active_habits").default(0).notNull(),
  completedHabits: integer("completed_habits").default(0).notNull(),
  failedHabits: integer("failed_habits").default(0).notNull(),
  counterHabitsProgress: text("counter_habits_progress").default('{}'), // JSON string with habit_id: { value, maxValue }
  newHabitsCreated: integer("new_habits_created").default(0).notNull(),
  
  // Additional metrics
  userId: integer("user_id").references(() => users.id), // Nullable foreign key
  createdAt: text("created_at").notNull(), // ISO date-time string
});

export const insertDailyAnalyticsSchema = createInsertSchema(dailyAnalytics).pick({
  date: true,
  totalTasks: true,
  completedTasks: true,
  newTasksCreated: true,
  totalHabits: true,
  activeHabits: true,
  completedHabits: true,
  failedHabits: true,
  counterHabitsProgress: true,
  newHabitsCreated: true,
  userId: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertDailyAnalytics = z.infer<typeof insertDailyAnalyticsSchema>;
export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
