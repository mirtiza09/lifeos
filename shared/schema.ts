import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  hashedPasscode: text("hashed_passcode"), // 4-digit passcode (hashed)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  hashedPasscode: true,
});

// Tasks table for Life OS
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: text("created_at").notNull(), // ISO date string
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  category: true,
  content: true,
  updatedAt: true,
  userId: true,
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
