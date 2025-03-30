
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/habits-id/index.js
import { Context } from "@netlify/functions";

// netlify/api/netlify-adapter.js
var tasksMap = /* @__PURE__ */ new Map();
var habitsMap = /* @__PURE__ */ new Map();
var notesMap = /* @__PURE__ */ new Map();
var userMap = /* @__PURE__ */ new Map();
var taskCurrentId = 1;
var habitCurrentId = 1;
var noteCurrentId = 1;
var userCurrentId = 1;
var DEFAULT_DAY_START_TIME = "04:00";
var dayStartTime = DEFAULT_DAY_START_TIME;
var createServerlessStorage = () => {
  if (tasksMap.size === 0 && habitsMap.size === 0 && notesMap.size === 0) {
    initializeDefaultData();
  }
  return {
    // User methods
    async getUser(id) {
      return userMap.get(id) || null;
    },
    async getUserByUsername(username) {
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      userMap.set(id, user);
      return user;
    },
    // Task methods
    async getTasks() {
      return Array.from(tasksMap.values()).sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      tasksMap.set(id, task);
      return task;
    },
    async updateTask(id, taskData) {
      const task = tasksMap.get(id);
      if (!task)
        return null;
      const updatedTask = {
        ...task,
        ...taskData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      tasksMap.set(id, updatedTask);
      return updatedTask;
    },
    async deleteTask(id) {
      const task = tasksMap.get(id);
      if (!task)
        return false;
      tasksMap.delete(id);
      return true;
    },
    // Habit methods
    async getHabits() {
      const now = /* @__PURE__ */ new Date();
      const habitsArray = Array.from(habitsMap.values());
      return habitsArray.map((habit) => ({
        ...habit,
        isActiveToday: isHabitActiveToday(habit)
      }));
    },
    async getHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit)
        return null;
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
        status: "pending",
        // 'pending', 'completed', 'failed'
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, habit);
      return {
        ...habit,
        isActiveToday: isHabitActiveToday(habit)
      };
    },
    async updateHabit(id, habitData) {
      const habit = habitsMap.get(id);
      if (!habit)
        return null;
      const updatedHabit = {
        ...habit,
        ...habitData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async completeHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit)
        return null;
      const updatedHabit = {
        ...habit,
        status: "completed",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async failHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit)
        return null;
      const updatedHabit = {
        ...habit,
        status: "failed",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async resetHabitStatus(id) {
      const habit = habitsMap.get(id);
      if (!habit)
        return null;
      const updatedHabit = {
        ...habit,
        status: "pending",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async incrementHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit || habit.type !== "counter")
        return null;
      const currentValue = typeof habit.currentValue === "number" ? habit.currentValue : 0;
      const maxValue = typeof habit.maxValue === "number" ? habit.maxValue : Infinity;
      const newValue = Math.min(currentValue + 1, maxValue);
      const status = newValue >= maxValue ? "completed" : "pending";
      const updatedHabit = {
        ...habit,
        currentValue: newValue,
        status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async decrementHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit || habit.type !== "counter")
        return null;
      const currentValue = typeof habit.currentValue === "number" ? habit.currentValue : 0;
      const newValue = Math.max(currentValue - 1, 0);
      const maxValue = typeof habit.maxValue === "number" ? habit.maxValue : Infinity;
      const status = newValue >= maxValue ? "completed" : "pending";
      const updatedHabit = {
        ...habit,
        currentValue: newValue,
        status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      habitsMap.set(id, updatedHabit);
      return {
        ...updatedHabit,
        isActiveToday: isHabitActiveToday(updatedHabit)
      };
    },
    async deleteHabit(id) {
      const habit = habitsMap.get(id);
      if (!habit)
        return false;
      habitsMap.delete(id);
      return true;
    },
    // Note methods
    async getNotes() {
      return Array.from(notesMap.values()).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    async getNoteByCategory(category) {
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      notesMap.set(id, note);
      return note;
    },
    async updateNote(id, noteData) {
      const note = notesMap.get(id);
      if (!note)
        return null;
      const updatedNote = {
        ...note,
        ...noteData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      notesMap.set(id, updatedNote);
      return updatedNote;
    },
    async getNoteById(id) {
      return notesMap.get(id) || null;
    },
    async deleteNote(id) {
      const note = notesMap.get(id);
      if (!note)
        return false;
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
        for (const [id, habit] of habitsMap.entries()) {
          if (habit.type === "boolean" && habit.status !== "pending") {
            habitsMap.set(id, {
              ...habit,
              status: "pending",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          if (habit.type === "counter") {
            habitsMap.set(id, {
              ...habit,
              currentValue: 0,
              status: "pending",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
      }
      return true;
    }
  };
};
function isHabitActiveToday(habit) {
  if (!habit.repeatType)
    return true;
  const today = /* @__PURE__ */ new Date();
  const dayOfWeek = today.getDay();
  if (habit.repeatType === "daily") {
    if (habit.repeatDays === "*")
      return true;
    return habit.repeatDays.includes(dayOfWeek.toString());
  }
  if (habit.repeatType === "weekly") {
    if (habit.repeatDays === "*")
      return true;
    return habit.repeatDays.includes(dayOfWeek.toString());
  }
  return true;
}
function initializeDefaultData() {
  const habit1 = {
    id: habitCurrentId++,
    name: "Morning Exercise",
    type: "boolean",
    repeatType: "daily",
    repeatDays: "*",
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const habit2 = {
    id: habitCurrentId++,
    name: "Drink water",
    type: "counter",
    maxValue: 8,
    currentValue: 0,
    repeatType: "daily",
    repeatDays: "*",
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  habitsMap.set(habit1.id, habit1);
  habitsMap.set(habit2.id, habit2);
  const task = {
    id: taskCurrentId++,
    text: "Create project plan",
    completed: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  tasksMap.set(task.id, task);
  const note1 = {
    id: noteCurrentId++,
    category: "Health",
    content: "# Health Goals\n\n- Improve sleep schedule\n- Drink more water\n- Exercise 3 times a week",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const note2 = {
    id: noteCurrentId++,
    category: "Career",
    content: "# Career Notes\n\n- Update resume\n- Network with industry professionals\n- Learn new skills",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const note3 = {
    id: noteCurrentId++,
    category: "Finances",
    content: "# Financial Goals\n\n- Save 20% of income\n- Review budget monthly\n- Research investment options",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const note4 = {
    id: noteCurrentId++,
    category: "Personal",
    content: "# Personal Development\n\n- Read one book per month\n- Practice meditation\n- Spend quality time with family",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  notesMap.set(note1.id, note1);
  notesMap.set(note2.id, note2);
  notesMap.set(note3.id, note3);
  notesMap.set(note4.id, note4);
}
var netlifyStorage = createServerlessStorage();

// netlify/api/pg-netlify-adapter.js
import pkg from "pg";
var { Pool } = pkg;
var pool;
var createPgStorage = () => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("ERROR: DATABASE_URL environment variable is missing");
      throw new Error("DATABASE_URL environment variable is required");
    }
    console.log(`Initializing PostgreSQL connection (URL length: ${databaseUrl.length})`);
    pool = new Pool({
      connectionString: databaseUrl,
      // Enable SSL with rejectUnauthorized set to false for Netlify
      ssl: {
        rejectUnauthorized: false
      }
    });
    pool.query("SELECT NOW()").then(() => console.log("PostgreSQL database connection successful")).catch((err) => {
      console.error("PostgreSQL connection error:", err.message);
      console.error("Stack trace:", err.stack);
    });
  }
  return {
    // User methods
    async getUser(id) {
      try {
        const result = await pool.query(
          "SELECT * FROM users WHERE id = $1",
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getUser:", error);
        throw error;
      }
    },
    async getUserByUsername(username) {
      try {
        const result = await pool.query(
          "SELECT * FROM users WHERE username = $1",
          [username]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getUserByUsername:", error);
        throw error;
      }
    },
    async createUser(userData) {
      try {
        const result = await pool.query(
          "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
          [userData.username, userData.password]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
      }
    },
    // Task methods
    async getTasks() {
      try {
        const result = await pool.query("SELECT * FROM tasks ORDER BY completed ASC, created_at DESC");
        return result.rows;
      } catch (error) {
        console.error("Error in getTasks:", error);
        throw error;
      }
    },
    async getTask(id) {
      try {
        const result = await pool.query(
          "SELECT * FROM tasks WHERE id = $1",
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getTask:", error);
        throw error;
      }
    },
    async createTask(taskData) {
      try {
        console.log("Creating task with data:", JSON.stringify(taskData));
        const text = taskData.text;
        const completed = taskData.completed || false;
        const createdAt = taskData.createdAt || (/* @__PURE__ */ new Date()).toISOString();
        const userId = taskData.userId || null;
        const result = await pool.query(
          "INSERT INTO tasks (text, completed, created_at, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [text, completed, createdAt, userId]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in createTask:", error);
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
        throw error;
      }
    },
    async updateTask(id, taskData) {
      try {
        const updates = [];
        const values = [];
        if ("text" in taskData) {
          updates.push(`text = $${updates.length + 1}`);
          values.push(taskData.text);
        }
        if ("completed" in taskData) {
          updates.push(`completed = $${updates.length + 1}`);
          values.push(taskData.completed);
        }
        if ("createdAt" in taskData) {
          updates.push(`created_at = $${updates.length + 1}`);
          values.push(taskData.createdAt);
        }
        if ("userId" in taskData) {
          updates.push(`user_id = $${updates.length + 1}`);
          values.push(taskData.userId);
        }
        if (updates.length === 0)
          return null;
        values.push(id);
        const query = `
          UPDATE tasks
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING *
        `;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in updateTask:", error);
        throw error;
      }
    },
    async deleteTask(id) {
      try {
        const result = await pool.query(
          "DELETE FROM tasks WHERE id = $1 RETURNING *",
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error("Error in deleteTask:", error);
        throw error;
      }
    },
    // Habit methods
    async getHabits() {
      try {
        const result = await pool.query("SELECT * FROM habits");
        const habits = result.rows;
        return habits.map((habit) => ({
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        }));
      } catch (error) {
        console.error("Error in getHabits:", error);
        throw error;
      }
    },
    async getHabit(id) {
      try {
        const result = await pool.query(
          "SELECT * FROM habits WHERE id = $1",
          [id]
        );
        const habit = result.rows[0];
        if (!habit)
          return null;
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in getHabit:", error);
        throw error;
      }
    },
    async createHabit(habitData) {
      try {
        let repeatDays = habitData.repeatDays;
        if (Array.isArray(repeatDays)) {
          repeatDays = repeatDays.join(",");
        }
        const result = await pool.query(
          `INSERT INTO habits (
            name, type, value, max_value, status, repeat_type, repeat_days, user_id, last_reset
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            habitData.name,
            habitData.type || "boolean",
            habitData.value || 0,
            habitData.maxValue || 0,
            habitData.status || "pending",
            habitData.repeatType || "daily",
            repeatDays || "*",
            habitData.userId || null,
            habitData.lastReset || (/* @__PURE__ */ new Date()).toISOString()
          ]
        );
        const habit = result.rows[0];
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in createHabit:", error);
        throw error;
      }
    },
    async updateHabit(id, habitData) {
      try {
        const updates = [];
        const values = [];
        if ("repeatDays" in habitData) {
          let repeatDays = habitData.repeatDays;
          if (Array.isArray(repeatDays)) {
            repeatDays = repeatDays.join(",");
          }
          updates.push(`repeat_days = $${updates.length + 1}`);
          values.push(repeatDays);
        }
        const fields = {
          name: "name",
          type: "type",
          value: "value",
          maxValue: "max_value",
          status: "status",
          repeatType: "repeat_type",
          userId: "user_id",
          lastReset: "last_reset"
        };
        for (const [jsField, dbField] of Object.entries(fields)) {
          if (jsField in habitData) {
            updates.push(`${dbField} = $${updates.length + 1}`);
            values.push(habitData[jsField]);
          }
        }
        if (updates.length === 0)
          return null;
        values.push(id);
        const query = `
          UPDATE habits
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING *
        `;
        const result = await pool.query(query, values);
        const habit = result.rows[0];
        if (!habit)
          return null;
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in updateHabit:", error);
        throw error;
      }
    },
    async completeHabit(id) {
      try {
        const result = await pool.query(
          "UPDATE habits SET status = $1 WHERE id = $2 RETURNING *",
          ["completed", id]
        );
        const habit = result.rows[0];
        if (!habit)
          return null;
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in completeHabit:", error);
        throw error;
      }
    },
    async failHabit(id) {
      try {
        const result = await pool.query(
          "UPDATE habits SET status = $1 WHERE id = $2 RETURNING *",
          ["failed", id]
        );
        const habit = result.rows[0];
        if (!habit)
          return null;
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in failHabit:", error);
        throw error;
      }
    },
    async resetHabitStatus(id) {
      try {
        const result = await pool.query(
          "UPDATE habits SET status = $1 WHERE id = $2 RETURNING *",
          ["pending", id]
        );
        const habit = result.rows[0];
        if (!habit)
          return null;
        return {
          ...habit,
          isActiveToday: isHabitActiveToday2(habit)
        };
      } catch (error) {
        console.error("Error in resetHabitStatus:", error);
        throw error;
      }
    },
    async incrementHabit(id) {
      try {
        const habitResult = await pool.query(
          "SELECT * FROM habits WHERE id = $1",
          [id]
        );
        const habit = habitResult.rows[0];
        if (!habit || habit.type !== "counter")
          return null;
        const currentValue = habit.value || 0;
        const maxValue = habit.max_value || 0;
        const newValue = Math.min(currentValue + 1, maxValue);
        const newStatus = newValue >= maxValue ? "completed" : "pending";
        const result = await pool.query(
          "UPDATE habits SET value = $1, status = $2 WHERE id = $3 RETURNING *",
          [newValue, newStatus, id]
        );
        const updatedHabit = result.rows[0];
        if (!updatedHabit)
          return null;
        return {
          ...updatedHabit,
          isActiveToday: isHabitActiveToday2(updatedHabit)
        };
      } catch (error) {
        console.error("Error in incrementHabit:", error);
        throw error;
      }
    },
    async decrementHabit(id) {
      try {
        const habitResult = await pool.query(
          "SELECT * FROM habits WHERE id = $1",
          [id]
        );
        const habit = habitResult.rows[0];
        if (!habit || habit.type !== "counter")
          return null;
        const currentValue = habit.value || 0;
        const maxValue = habit.max_value || 0;
        const newValue = Math.max(currentValue - 1, 0);
        const newStatus = newValue >= maxValue ? "completed" : "pending";
        const result = await pool.query(
          "UPDATE habits SET value = $1, status = $2 WHERE id = $3 RETURNING *",
          [newValue, newStatus, id]
        );
        const updatedHabit = result.rows[0];
        if (!updatedHabit)
          return null;
        return {
          ...updatedHabit,
          isActiveToday: isHabitActiveToday2(updatedHabit)
        };
      } catch (error) {
        console.error("Error in decrementHabit:", error);
        throw error;
      }
    },
    async deleteHabit(id) {
      try {
        const result = await pool.query(
          "DELETE FROM habits WHERE id = $1 RETURNING *",
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error("Error in deleteHabit:", error);
        throw error;
      }
    },
    // Note methods
    async getNotes() {
      try {
        const result = await pool.query("SELECT * FROM notes ORDER BY created_at DESC");
        return result.rows;
      } catch (error) {
        console.error("Error in getNotes:", error);
        throw error;
      }
    },
    async getNoteByCategory(category) {
      try {
        console.log(`Fetching note for category: ${category}`);
        const result = await pool.query(
          "SELECT * FROM notes WHERE LOWER(category) = LOWER($1)",
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
          "SELECT * FROM notes WHERE id = $1",
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getNoteById:", error);
        throw error;
      }
    },
    async createNote(noteData) {
      try {
        const existingNote = await this.getNoteByCategory(noteData.category);
        if (existingNote) {
          return await this.updateNote(existingNote.id, {
            content: noteData.content
          });
        }
        const result = await pool.query(
          "INSERT INTO notes (category, content, created_at) VALUES ($1, $2, $3) RETURNING *",
          [
            noteData.category,
            noteData.content,
            noteData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          ]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in createNote:", error);
        throw error;
      }
    },
    async updateNote(id, noteData) {
      try {
        const updates = [];
        const values = [];
        if ("category" in noteData) {
          updates.push(`category = $${updates.length + 1}`);
          values.push(noteData.category);
        }
        if ("content" in noteData) {
          updates.push(`content = $${updates.length + 1}`);
          values.push(noteData.content);
        }
        if (updates.length === 0)
          return null;
        values.push(id);
        const query = `
          UPDATE notes
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING *
        `;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in updateNote:", error);
        throw error;
      }
    },
    async deleteNote(id) {
      try {
        const result = await pool.query(
          "DELETE FROM notes WHERE id = $1 RETURNING *",
          [id]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error("Error in deleteNote:", error);
        throw error;
      }
    },
    // Daily data logging
    async logDailyData(dateStr, resetHabits = true) {
      if (resetHabits) {
        try {
          await pool.query(
            "UPDATE habits SET status = 'pending' WHERE type = 'boolean'"
          );
          await pool.query(
            "UPDATE habits SET value = 0, status = 'pending' WHERE type = 'counter'"
          );
          return true;
        } catch (error) {
          console.error("Error in logDailyData:", error);
          throw error;
        }
      }
      return true;
    },
    // Settings
    async getDayStartTime() {
      try {
        return "04:00";
      } catch (error) {
        console.error("Error in getDayStartTime:", error);
        return "04:00";
      }
    },
    async setDayStartTime(time) {
      return time;
    }
  };
};
function isHabitActiveToday2(habit) {
  if (!habit.repeat_type)
    return true;
  const today = /* @__PURE__ */ new Date();
  const dayOfWeek = today.getDay();
  if (habit.repeat_type === "daily") {
    if (habit.repeat_days === "*")
      return true;
    const repeatDays = typeof habit.repeat_days === "string" ? habit.repeat_days.split(",") : habit.repeat_days;
    return repeatDays.includes(dayOfWeek.toString());
  }
  if (habit.repeat_type === "weekly") {
    if (habit.repeat_days === "*")
      return true;
    const repeatDays = typeof habit.repeat_days === "string" ? habit.repeat_days.split(",") : habit.repeat_days;
    return repeatDays.includes(dayOfWeek.toString());
  }
  return true;
}
var pgStorage = createPgStorage();

// netlify/api/_storage.js
var selectedStorage;
if (process.env.DATABASE_URL) {
  console.log("Using PostgreSQL storage for Netlify Functions");
  selectedStorage = pgStorage;
} else {
  console.log("DATABASE_URL not found, using in-memory storage (not recommended for production)");
  selectedStorage = netlifyStorage;
}
var storage = selectedStorage;

// netlify/api/_error-handler.js
function withErrorHandler(handler) {
  return async function(req, res) {
    try {
      if (req.method !== "GET" && req.body === void 0) {
        req.body = {};
      }
      return await handler(req, res);
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      let statusCode = 500;
      if (error.message.includes("not found"))
        statusCode = 404;
      else if (error.message.includes("required") || error.message.includes("Invalid"))
        statusCode = 400;
      else if (error.message.includes("unauthorized") || error.message.includes("forbidden"))
        statusCode = 403;
      return res.status(statusCode).json({
        error: true,
        message: error.message
      });
    }
  };
}
function validateId(req, paramName = "id") {
  const id = parseInt(req.params[paramName]);
  if (isNaN(id)) {
    throw new Error(`Invalid ${paramName} parameter. Expected a number.`);
  }
  return id;
}

// netlify/api/habits/[id].js
async function habitHandler(req, res) {
  const id = validateId(req);
  if (req.method === "GET") {
    try {
      const habit = await storage.getHabit(id);
      if (!habit) {
        return res.status(404).json({
          error: true,
          message: `Habit with ID ${id} not found`
        });
      }
      return res.status(200).json(habit);
    } catch (error) {
      throw new Error(`Error retrieving habit: ${error.message}`);
    }
  }
  if (req.method === "PATCH") {
    try {
      const updates = req.body;
      updates.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const updatedHabit = await storage.updateHabit(id, updates);
      if (!updatedHabit) {
        return res.status(404).json({
          error: true,
          message: `Habit with ID ${id} not found`
        });
      }
      return res.status(200).json(updatedHabit);
    } catch (error) {
      throw new Error(`Error updating habit: ${error.message}`);
    }
  }
  if (req.method === "DELETE") {
    try {
      const success = await storage.deleteHabit(id);
      if (!success) {
        return res.status(404).json({
          error: true,
          message: `Habit with ID ${id} not found`
        });
      }
      return res.status(200).json({
        success: true,
        message: `Habit with ID ${id} deleted successfully`
      });
    } catch (error) {
      throw new Error(`Error deleting habit: ${error.message}`);
    }
  }
  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}
var id_default = withErrorHandler(habitHandler);

// netlify/functions/habits-id/index.js
var expressToNetlify = async (req, context) => {
  const mockReq = {
    method: req.method,
    url: req.url,
    path: new URL(req.url).pathname,
    query: Object.fromEntries(new URL(req.url).searchParams),
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.json() : void 0,
    params: context.params || {}
  };
  let statusCode = 200;
  let responseBody = {};
  let responseHeaders = {};
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (body) => {
      responseBody = body;
      responseHeaders["Content-Type"] = "application/json";
      return mockRes;
    },
    send: (body) => {
      responseBody = body;
      return mockRes;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    set: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    end: () => {
    }
  };
  await id_default(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var habits_id_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/habits/:$1.js"
};
export {
  config,
  habits_id_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvaGFiaXRzLWlkL2luZGV4LmpzIiwgIm5ldGxpZnkvYXBpL25ldGxpZnktYWRhcHRlci5qcyIsICJuZXRsaWZ5L2FwaS9wZy1uZXRsaWZ5LWFkYXB0ZXIuanMiLCAibmV0bGlmeS9hcGkvX3N0b3JhZ2UuanMiLCAibmV0bGlmeS9hcGkvX2Vycm9yLWhhbmRsZXIuanMiLCAibmV0bGlmeS9hcGkvaGFiaXRzL1tpZF0uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgZm9yIG5lc3RlZCBBUEk6IGhhYml0cy9baWRdLmpzXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xuLy8gRml4OiBVc2UgYWJzb2x1dGUgcGF0aCByZWZlcmVuY2UgZm9yIHJlbGlhYmxlIGltcG9ydHNcbmltcG9ydCBvcmlnaW5hbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL25ldGxpZnkvYXBpL2hhYml0cy9baWRdLmpzXCI7XG5cbi8vIEV4cHJlc3MgYWRhcHRlciB0byBjb252ZXJ0IFJlcXVlc3QvUmVzcG9uc2Ugb2JqZWN0c1xuY29uc3QgZXhwcmVzc1RvTmV0bGlmeSA9IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgLy8gTW9jayBFeHByZXNzLWxpa2Ugb2JqZWN0c1xuICBjb25zdCBtb2NrUmVxID0ge1xuICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICB1cmw6IHJlcS51cmwsXG4gICAgcGF0aDogbmV3IFVSTChyZXEudXJsKS5wYXRobmFtZSxcbiAgICBxdWVyeTogT2JqZWN0LmZyb21FbnRyaWVzKG5ldyBVUkwocmVxLnVybCkuc2VhcmNoUGFyYW1zKSxcbiAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVxLmhlYWRlcnMpLFxuICAgIGJvZHk6IHJlcS5ib2R5ID8gYXdhaXQgcmVxLmpzb24oKSA6IHVuZGVmaW5lZCxcbiAgICBwYXJhbXM6IGNvbnRleHQucGFyYW1zIHx8IHt9XG4gIH07XG4gIFxuICBsZXQgc3RhdHVzQ29kZSA9IDIwMDtcbiAgbGV0IHJlc3BvbnNlQm9keSA9IHt9O1xuICBsZXQgcmVzcG9uc2VIZWFkZXJzID0ge307XG4gIFxuICAvLyBNb2NrIEV4cHJlc3MgcmVzcG9uc2VcbiAgY29uc3QgbW9ja1JlcyA9IHtcbiAgICBzdGF0dXM6IChjb2RlKSA9PiB7XG4gICAgICBzdGF0dXNDb2RlID0gY29kZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAganNvbjogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXNwb25zZUhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZW5kOiAoYm9keSkgPT4ge1xuICAgICAgcmVzcG9uc2VCb2R5ID0gYm9keTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0SGVhZGVyOiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZXQ6IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGVuZDogKCkgPT4ge31cbiAgfTtcbiAgXG4gIC8vIENhbGwgdGhlIG9yaWdpbmFsIEV4cHJlc3MgaGFuZGxlclxuICBhd2FpdCBvcmlnaW5hbEhhbmRsZXIobW9ja1JlcSwgbW9ja1Jlcyk7XG4gIFxuICAvLyBDb252ZXJ0IHRvIE5ldGxpZnkgUmVzcG9uc2VcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICB0eXBlb2YgcmVzcG9uc2VCb2R5ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlQm9keSkgOiByZXNwb25zZUJvZHksXG4gICAge1xuICAgICAgc3RhdHVzOiBzdGF0dXNDb2RlLFxuICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzXG4gICAgfVxuICApO1xufTtcblxuLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gaGFuZGxlclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xuICByZXR1cm4gZXhwcmVzc1RvTmV0bGlmeShyZXEsIGNvbnRleHQpO1xufTtcblxuLy8gQ29uZmlndXJlIHJvdXRpbmdcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIHBhdGg6IFwiL2FwaS9oYWJpdHMvOiQxLmpzXCJcbn07XG4iLCAiLyoqXG4gKiBOZXRsaWZ5IEZ1bmN0aW9ucyBTdG9yYWdlIEFkYXB0ZXIgKE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9ucyBDb21wYXRpYmxlKVxuICogXG4gKiBJbi1tZW1vcnkgc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiBzcGVjaWZpY2FsbHkgb3B0aW1pemVkIGZvciBOZXRsaWZ5J3Mgc2VydmVybGVzcyBlbnZpcm9ubWVudC5cbiAqIFRoaXMgYWRhcHRlciBpcyBkZXNpZ25lZCB0byB3b3JrIHdpdGggdGhlIG1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9ucyBBUEkgYW5kIHByb3ZpZGVzOlxuICogXG4gKiAxLiBQZXJzaXN0ZW50IGluLW1lbW9yeSBzdG9yYWdlIGFjcm9zcyBmdW5jdGlvbiBpbnZvY2F0aW9ucyAod2l0aGluIHRoZSBzYW1lIGZ1bmN0aW9uIGluc3RhbmNlKVxuICogMi4gQ29tcGF0aWJpbGl0eSB3aXRoIE5ldGxpZnkncyByZWFkLW9ubHkgZmlsZXN5c3RlbVxuICogMy4gQXV0b21hdGljIGluaXRpYWxpemF0aW9uIHdpdGggZGVmYXVsdCBkYXRhXG4gKiA0LiBDb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3RvcmFnZSBpbnRlcmZhY2VcbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbi1tZW1vcnkgc3RvcmFnZSBtYXBzXG5jb25zdCB0YXNrc01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IGhhYml0c01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IG5vdGVzTWFwID0gbmV3IE1hcCgpO1xuY29uc3QgdXNlck1hcCA9IG5ldyBNYXAoKTtcblxuLy8gQ291bnRlciBmb3IgZ2VuZXJhdGluZyBJRHNcbmxldCB0YXNrQ3VycmVudElkID0gMTtcbmxldCBoYWJpdEN1cnJlbnRJZCA9IDE7XG5sZXQgbm90ZUN1cnJlbnRJZCA9IDE7XG5sZXQgdXNlckN1cnJlbnRJZCA9IDE7XG5cbi8vIERheSBzdGFydCB0aW1lIHNldHRpbmdcbmNvbnN0IERFRkFVTFRfREFZX1NUQVJUX1RJTUUgPSAnMDQ6MDAnOyAvLyA0IEFNIGRlZmF1bHRcbmxldCBkYXlTdGFydFRpbWUgPSBERUZBVUxUX0RBWV9TVEFSVF9USU1FO1xuXG4vLyBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2ZXJsZXNzU3RvcmFnZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHQgZGF0YVxuICBpZiAodGFza3NNYXAuc2l6ZSA9PT0gMCAmJiBoYWJpdHNNYXAuc2l6ZSA9PT0gMCAmJiBub3Rlc01hcC5zaXplID09PSAwKSB7XG4gICAgaW5pdGlhbGl6ZURlZmF1bHREYXRhKCk7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgLy8gVXNlciBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VXNlcihpZCkge1xuICAgICAgcmV0dXJuIHVzZXJNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgICAgIC8vIEZpbmQgdGhlIHVzZXIgd2l0aCB0aGUgZ2l2ZW4gdXNlcm5hbWVcbiAgICAgIGZvciAoY29uc3QgdXNlciBvZiB1c2VyTWFwLnZhbHVlcygpKSB7XG4gICAgICAgIGlmICh1c2VyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKCkgPT09IHVzZXJuYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVVc2VyKHVzZXJEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IHVzZXJDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IHVzZXIgPSB7IFxuICAgICAgICAuLi51c2VyRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICB1c2VyTWFwLnNldChpZCwgdXNlcik7XG4gICAgICByZXR1cm4gdXNlcjtcbiAgICB9LFxuICAgIFxuICAgIC8vIFRhc2sgbWV0aG9kc1xuICAgIGFzeW5jIGdldFRhc2tzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGFza3NNYXAudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgLy8gQ29tcGxldGVkIHRhc2tzIHNob3VsZCBhcHBlYXIgYWZ0ZXIgbm9uLWNvbXBsZXRlZCB0YXNrc1xuICAgICAgICBpZiAoYS5jb21wbGV0ZWQgIT09IGIuY29tcGxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIGEuY29tcGxldGVkID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNvcnQgYnkgY3JlYXRpb24gZGF0ZSAobmV3ZXN0IGZpcnN0KVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoYi5jcmVhdGVkQXQpIC0gbmV3IERhdGUoYS5jcmVhdGVkQXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRUYXNrKGlkKSB7XG4gICAgICByZXR1cm4gdGFza3NNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVGFzayh0YXNrRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSB0YXNrQ3VycmVudElkKys7XG4gICAgICBjb25zdCB0YXNrID0geyBcbiAgICAgICAgLi4udGFza0RhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgdGFza3NNYXAuc2V0KGlkLCB0YXNrKTtcbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlVGFzayhpZCwgdGFza0RhdGEpIHtcbiAgICAgIGNvbnN0IHRhc2sgPSB0YXNrc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCF0YXNrKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSB7IFxuICAgICAgICAuLi50YXNrLCBcbiAgICAgICAgLi4udGFza0RhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICB0YXNrc01hcC5zZXQoaWQsIHVwZGF0ZWRUYXNrKTtcbiAgICAgIHJldHVybiB1cGRhdGVkVGFzaztcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZVRhc2soaWQpIHtcbiAgICAgIGNvbnN0IHRhc2sgPSB0YXNrc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCF0YXNrKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIHRhc2tzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIEhhYml0IG1ldGhvZHNcbiAgICBhc3luYyBnZXRIYWJpdHMoKSB7XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgaGFiaXRzQXJyYXkgPSBBcnJheS5mcm9tKGhhYml0c01hcC52YWx1ZXMoKSk7XG4gICAgICBcbiAgICAgIC8vIEFkZCBpc0FjdGl2ZVRvZGF5IGZpZWxkIHRvIGVhY2ggaGFiaXRcbiAgICAgIHJldHVybiBoYWJpdHNBcnJheS5tYXAoaGFiaXQgPT4gKHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlSGFiaXQoaGFiaXREYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IGhhYml0Q3VycmVudElkKys7XG4gICAgICBjb25zdCBoYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0RGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJywgLy8gJ3BlbmRpbmcnLCAnY29tcGxldGVkJywgJ2ZhaWxlZCdcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCBoYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZUhhYml0KGlkLCBoYWJpdERhdGEpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICAuLi5oYWJpdERhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNvbXBsZXRlSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmYWlsSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdmYWlsZWQnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyByZXNldEhhYml0U3RhdHVzKGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGluY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0eXBlb2YgaGFiaXQuY3VycmVudFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0LmN1cnJlbnRWYWx1ZSA6IDA7XG4gICAgICBjb25zdCBtYXhWYWx1ZSA9IHR5cGVvZiBoYWJpdC5tYXhWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5tYXhWYWx1ZSA6IEluZmluaXR5O1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1pbihjdXJyZW50VmFsdWUgKyAxLCBtYXhWYWx1ZSk7XG4gICAgICBcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgY3VycmVudFZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdHlwZW9mIGhhYml0LmN1cnJlbnRWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5jdXJyZW50VmFsdWUgOiAwO1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1heChjdXJyZW50VmFsdWUgLSAxLCAwKTtcbiAgICAgIFxuICAgICAgY29uc3QgbWF4VmFsdWUgPSB0eXBlb2YgaGFiaXQubWF4VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQubWF4VmFsdWUgOiBJbmZpbml0eTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgY3VycmVudFZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIE5vdGUgbWV0aG9kc1xuICAgIGFzeW5jIGdldE5vdGVzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20obm90ZXNNYXAudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgLy8gU29ydCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShiLmNyZWF0ZWRBdCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgICAvLyBGaW5kIHRoZSBub3RlIHdpdGggdGhlIGdpdmVuIGNhdGVnb3J5IChjYXNlLWluc2Vuc2l0aXZlKVxuICAgICAgZm9yIChjb25zdCBub3RlIG9mIG5vdGVzTWFwLnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChub3RlLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCkgPT09IGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICByZXR1cm4gbm90ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVOb3RlKG5vdGVEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IG5vdGVDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IG5vdGUgPSB7IFxuICAgICAgICAuLi5ub3RlRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLnNldChpZCwgbm90ZSk7XG4gICAgICByZXR1cm4gbm90ZTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZU5vdGUoaWQsIG5vdGVEYXRhKSB7XG4gICAgICBjb25zdCBub3RlID0gbm90ZXNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghbm90ZSkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWROb3RlID0geyBcbiAgICAgICAgLi4ubm90ZSwgXG4gICAgICAgIC4uLm5vdGVEYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuc2V0KGlkLCB1cGRhdGVkTm90ZSk7XG4gICAgICByZXR1cm4gdXBkYXRlZE5vdGU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlJZChpZCkge1xuICAgICAgcmV0dXJuIG5vdGVzTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZU5vdGUoaWQpIHtcbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFub3RlKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIFNldHRpbmdzXG4gICAgYXN5bmMgZ2V0RGF5U3RhcnRUaW1lKCkge1xuICAgICAgcmV0dXJuIGRheVN0YXJ0VGltZSB8fCBERUZBVUxUX0RBWV9TVEFSVF9USU1FO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgc2V0RGF5U3RhcnRUaW1lKHRpbWUpIHtcbiAgICAgIGRheVN0YXJ0VGltZSA9IHRpbWU7XG4gICAgICByZXR1cm4gZGF5U3RhcnRUaW1lO1xuICAgIH0sXG4gICAgXG4gICAgLy8gRGFpbHkgZGF0YSBsb2dnaW5nXG4gICAgYXN5bmMgbG9nRGFpbHlEYXRhKGRhdGVTdHIsIHJlc2V0SGFiaXRzID0gdHJ1ZSkge1xuICAgICAgaWYgKHJlc2V0SGFiaXRzKSB7XG4gICAgICAgIC8vIFJlc2V0IGFsbCBib29sZWFuIGhhYml0cyB0byBwZW5kaW5nXG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBoYWJpdF0gb2YgaGFiaXRzTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmIChoYWJpdC50eXBlID09PSAnYm9vbGVhbicgJiYgaGFiaXQuc3RhdHVzICE9PSAncGVuZGluZycpIHtcbiAgICAgICAgICAgIGhhYml0c01hcC5zZXQoaWQsIHtcbiAgICAgICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlc2V0IGFsbCBjb3VudGVyIGhhYml0cyB0byAwXG4gICAgICAgICAgaWYgKGhhYml0LnR5cGUgPT09ICdjb3VudGVyJykge1xuICAgICAgICAgICAgaGFiaXRzTWFwLnNldChpZCwge1xuICAgICAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICAgICAgY3VycmVudFZhbHVlOiAwLFxuICAgICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgaGFiaXQgaXMgYWN0aXZlIG9uIGEgZ2l2ZW4gZGF5XG5mdW5jdGlvbiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpIHtcbiAgaWYgKCFoYWJpdC5yZXBlYXRUeXBlKSByZXR1cm4gdHJ1ZTtcbiAgXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5T2ZXZWVrID0gdG9kYXkuZ2V0RGF5KCk7IC8vIDAgPSBTdW5kYXksIDEgPSBNb25kYXksIGV0Yy5cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRUeXBlID09PSAnZGFpbHknKSB7XG4gICAgLy8gRm9yIGRhaWx5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBldmVyeSBkYXkgb3Igb25seSBvbiBzcGVjaWZpYyBkYXlzXG4gICAgaWYgKGhhYml0LnJlcGVhdERheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIGhhYml0LnJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICBpZiAoaGFiaXQucmVwZWF0VHlwZSA9PT0gJ3dlZWtseScpIHtcbiAgICAvLyBGb3Igd2Vla2x5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBvbiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIGlmIChoYWJpdC5yZXBlYXREYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiBoYWJpdC5yZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIEluaXRpYWxpemUgd2l0aCBzb21lIGV4YW1wbGUgZGF0YVxuZnVuY3Rpb24gaW5pdGlhbGl6ZURlZmF1bHREYXRhKCkge1xuICAvLyBDcmVhdGUgc29tZSBkZWZhdWx0IGhhYml0c1xuICBjb25zdCBoYWJpdDEgPSB7XG4gICAgaWQ6IGhhYml0Q3VycmVudElkKyssXG4gICAgbmFtZTogJ01vcm5pbmcgRXhlcmNpc2UnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICByZXBlYXRUeXBlOiAnZGFpbHknLFxuICAgIHJlcGVhdERheXM6ICcqJyxcbiAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3QgaGFiaXQyID0ge1xuICAgIGlkOiBoYWJpdEN1cnJlbnRJZCsrLFxuICAgIG5hbWU6ICdEcmluayB3YXRlcicsXG4gICAgdHlwZTogJ2NvdW50ZXInLFxuICAgIG1heFZhbHVlOiA4LFxuICAgIGN1cnJlbnRWYWx1ZTogMCxcbiAgICByZXBlYXRUeXBlOiAnZGFpbHknLFxuICAgIHJlcGVhdERheXM6ICcqJyxcbiAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgaGFiaXRzTWFwLnNldChoYWJpdDEuaWQsIGhhYml0MSk7XG4gIGhhYml0c01hcC5zZXQoaGFiaXQyLmlkLCBoYWJpdDIpO1xuICBcbiAgLy8gQ3JlYXRlIGRlZmF1bHQgdGFza1xuICBjb25zdCB0YXNrID0ge1xuICAgIGlkOiB0YXNrQ3VycmVudElkKyssXG4gICAgdGV4dDogJ0NyZWF0ZSBwcm9qZWN0IHBsYW4nLFxuICAgIGNvbXBsZXRlZDogZmFsc2UsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIHRhc2tzTWFwLnNldCh0YXNrLmlkLCB0YXNrKTtcbiAgXG4gIC8vIENyZWF0ZSBkZWZhdWx0IG5vdGVzXG4gIGNvbnN0IG5vdGUxID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdIZWFsdGgnLFxuICAgIGNvbnRlbnQ6ICcjIEhlYWx0aCBHb2Fsc1xcblxcbi0gSW1wcm92ZSBzbGVlcCBzY2hlZHVsZVxcbi0gRHJpbmsgbW9yZSB3YXRlclxcbi0gRXhlcmNpc2UgMyB0aW1lcyBhIHdlZWsnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlMiA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnQ2FyZWVyJyxcbiAgICBjb250ZW50OiAnIyBDYXJlZXIgTm90ZXNcXG5cXG4tIFVwZGF0ZSByZXN1bWVcXG4tIE5ldHdvcmsgd2l0aCBpbmR1c3RyeSBwcm9mZXNzaW9uYWxzXFxuLSBMZWFybiBuZXcgc2tpbGxzJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTMgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0ZpbmFuY2VzJyxcbiAgICBjb250ZW50OiAnIyBGaW5hbmNpYWwgR29hbHNcXG5cXG4tIFNhdmUgMjAlIG9mIGluY29tZVxcbi0gUmV2aWV3IGJ1ZGdldCBtb250aGx5XFxuLSBSZXNlYXJjaCBpbnZlc3RtZW50IG9wdGlvbnMnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlNCA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnUGVyc29uYWwnLFxuICAgIGNvbnRlbnQ6ICcjIFBlcnNvbmFsIERldmVsb3BtZW50XFxuXFxuLSBSZWFkIG9uZSBib29rIHBlciBtb250aFxcbi0gUHJhY3RpY2UgbWVkaXRhdGlvblxcbi0gU3BlbmQgcXVhbGl0eSB0aW1lIHdpdGggZmFtaWx5JyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgbm90ZXNNYXAuc2V0KG5vdGUxLmlkLCBub3RlMSk7XG4gIG5vdGVzTWFwLnNldChub3RlMi5pZCwgbm90ZTIpO1xuICBub3Rlc01hcC5zZXQobm90ZTMuaWQsIG5vdGUzKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGU0LmlkLCBub3RlNCk7XG59XG5cbi8vIEV4cG9ydCB0aGUgbmV0bGlmeSBzdG9yYWdlIHNpbmdsZXRvblxuZXhwb3J0IGNvbnN0IG5ldGxpZnlTdG9yYWdlID0gY3JlYXRlU2VydmVybGVzc1N0b3JhZ2UoKTsiLCAiLyoqXG4gKiBQb3N0Z3JlU1FMIEFkYXB0ZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zXG4gKiBcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIGEgUG9zdGdyZVNRTC1iYXNlZCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3RvcmFnZSBpbnRlcmZhY2VcbiAqIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucy4gSXQgY29ubmVjdHMgZGlyZWN0bHkgdG8gdGhlIFBvc3RncmVTUUwgZGF0YWJhc2UgdXNpbmdcbiAqIHRoZSBEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW1wb3J0IHRoZSBwZyBtb2R1bGVcbmltcG9ydCBwa2cgZnJvbSAncGcnO1xuY29uc3QgeyBQb29sIH0gPSBwa2c7XG5cbi8vIENyZWF0ZSBhIGNvbm5lY3Rpb24gcG9vbFxubGV0IHBvb2w7XG5cbi8vIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgUG9zdGdyZVNRTC1iYXNlZCBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3JlYXRlUGdTdG9yYWdlID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXplIHBvb2wgaWYgbm90IGFscmVhZHkgY3JlYXRlZFxuICBpZiAoIXBvb2wpIHtcbiAgICBjb25zdCBkYXRhYmFzZVVybCA9IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTDtcbiAgICBcbiAgICBpZiAoIWRhdGFiYXNlVXJsKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFUlJPUjogREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG1pc3NpbmcnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEluaXRpYWxpemluZyBQb3N0Z3JlU1FMIGNvbm5lY3Rpb24gKFVSTCBsZW5ndGg6ICR7ZGF0YWJhc2VVcmwubGVuZ3RofSlgKTtcbiAgICBcbiAgICBwb29sID0gbmV3IFBvb2woe1xuICAgICAgY29ubmVjdGlvblN0cmluZzogZGF0YWJhc2VVcmwsXG4gICAgICAvLyBFbmFibGUgU1NMIHdpdGggcmVqZWN0VW5hdXRob3JpemVkIHNldCB0byBmYWxzZSBmb3IgTmV0bGlmeVxuICAgICAgc3NsOiB7XG4gICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRlc3QgdGhlIGNvbm5lY3Rpb25cbiAgICBwb29sLnF1ZXJ5KCdTRUxFQ1QgTk9XKCknKVxuICAgICAgLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Bvc3RncmVTUUwgZGF0YWJhc2UgY29ubmVjdGlvbiBzdWNjZXNzZnVsJykpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUG9zdGdyZVNRTCBjb25uZWN0aW9uIGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyLnN0YWNrKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBVc2VyIG1ldGhvZHNcbiAgICBhc3luYyBnZXRVc2VyKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRVc2VyOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSB1c2VybmFtZSA9ICQxJyxcbiAgICAgICAgICBbdXNlcm5hbWVdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VXNlckJ5VXNlcm5hbWU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVVzZXIodXNlckRhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIHVzZXJzICh1c2VybmFtZSwgcGFzc3dvcmQpIFZBTFVFUyAoJDEsICQyKSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW3VzZXJEYXRhLnVzZXJuYW1lLCB1c2VyRGF0YS5wYXNzd29yZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlVXNlcjonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gVGFzayBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VGFza3MoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIHRhc2tzIE9SREVSIEJZIGNvbXBsZXRlZCBBU0MsIGNyZWF0ZWRfYXQgREVTQycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRUYXNrczonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VGFzayhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB0YXNrcyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVGFzayh0YXNrRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIHRhc2sgd2l0aCBkYXRhOicsIEpTT04uc3RyaW5naWZ5KHRhc2tEYXRhKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBFeHRyYWN0IHRhc2sgcHJvcGVydGllcyB3aXRoIGRlZmF1bHRzXG4gICAgICAgIGNvbnN0IHRleHQgPSB0YXNrRGF0YS50ZXh0O1xuICAgICAgICBjb25zdCBjb21wbGV0ZWQgPSB0YXNrRGF0YS5jb21wbGV0ZWQgfHwgZmFsc2U7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IHRhc2tEYXRhLmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRhc2tEYXRhLnVzZXJJZCB8fCBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gdGFza3MgKHRleHQsIGNvbXBsZXRlZCwgY3JlYXRlZF9hdCwgdXNlcl9pZCkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCkgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFt0ZXh0LCBjb21wbGV0ZWQsIGNyZWF0ZWRBdCwgdXNlcklkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGV0YWlsczonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyb3Iuc3RhY2spO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZVRhc2soaWQsIHRhc2tEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCd0ZXh0JyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgdGV4dCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjb21wbGV0ZWQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjb21wbGV0ZWQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEuY29tcGxldGVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjcmVhdGVkQXQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjcmVhdGVkX2F0ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgndXNlcklkJyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgdXNlcl9pZCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS51c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIHRhc2tzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVUYXNrKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSB0YXNrcyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gSGFiaXQgbWV0aG9kc1xuICAgIGFzeW5jIGdldEhhYml0cygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gaGFiaXRzJyk7XG4gICAgICAgIGNvbnN0IGhhYml0cyA9IHJlc3VsdC5yb3dzO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIGlzQWN0aXZlVG9kYXkgZmllbGQgdG8gZWFjaCBoYWJpdFxuICAgICAgICByZXR1cm4gaGFiaXRzLm1hcChoYWJpdCA9PiAoe1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfSkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0SGFiaXRzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVIYWJpdChoYWJpdERhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENvbnZlcnQgYXJyYXkgdG8gc3RyaW5nIGZvciBkYXRhYmFzZSBzdG9yYWdlIGlmIG5lZWRlZFxuICAgICAgICBsZXQgcmVwZWF0RGF5cyA9IGhhYml0RGF0YS5yZXBlYXREYXlzO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXBlYXREYXlzKSkge1xuICAgICAgICAgIHJlcGVhdERheXMgPSByZXBlYXREYXlzLmpvaW4oJywnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICBgSU5TRVJUIElOVE8gaGFiaXRzIChcbiAgICAgICAgICAgIG5hbWUsIHR5cGUsIHZhbHVlLCBtYXhfdmFsdWUsIHN0YXR1cywgcmVwZWF0X3R5cGUsIHJlcGVhdF9kYXlzLCB1c2VyX2lkLCBsYXN0X3Jlc2V0XG4gICAgICAgICAgKSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3LCAkOCwgJDkpIFJFVFVSTklORyAqYCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBoYWJpdERhdGEubmFtZSxcbiAgICAgICAgICAgIGhhYml0RGF0YS50eXBlIHx8ICdib29sZWFuJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS52YWx1ZSB8fCAwLFxuICAgICAgICAgICAgaGFiaXREYXRhLm1heFZhbHVlIHx8IDAsXG4gICAgICAgICAgICBoYWJpdERhdGEuc3RhdHVzIHx8ICdwZW5kaW5nJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS5yZXBlYXRUeXBlIHx8ICdkYWlseScsXG4gICAgICAgICAgICByZXBlYXREYXlzIHx8ICcqJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS51c2VySWQgfHwgbnVsbCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5sYXN0UmVzZXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlSGFiaXQoaWQsIGhhYml0RGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZXBlYXREYXlzIHNwZWNpYWxseSAtIGNvbnZlcnQgYXJyYXkgdG8gc3RyaW5nXG4gICAgICAgIGlmICgncmVwZWF0RGF5cycgaW4gaGFiaXREYXRhKSB7XG4gICAgICAgICAgbGV0IHJlcGVhdERheXMgPSBoYWJpdERhdGEucmVwZWF0RGF5cztcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXBlYXREYXlzKSkge1xuICAgICAgICAgICAgcmVwZWF0RGF5cyA9IHJlcGVhdERheXMuam9pbignLCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHJlcGVhdF9kYXlzID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHJlcGVhdERheXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmaWVsZHMgPSB7XG4gICAgICAgICAgbmFtZTogJ25hbWUnLFxuICAgICAgICAgIHR5cGU6ICd0eXBlJyxcbiAgICAgICAgICB2YWx1ZTogJ3ZhbHVlJyxcbiAgICAgICAgICBtYXhWYWx1ZTogJ21heF92YWx1ZScsXG4gICAgICAgICAgc3RhdHVzOiAnc3RhdHVzJyxcbiAgICAgICAgICByZXBlYXRUeXBlOiAncmVwZWF0X3R5cGUnLFxuICAgICAgICAgIHVzZXJJZDogJ3VzZXJfaWQnLFxuICAgICAgICAgIGxhc3RSZXNldDogJ2xhc3RfcmVzZXQnXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgYWxsIHRoZSBvdGhlciBmaWVsZHNcbiAgICAgICAgZm9yIChjb25zdCBbanNGaWVsZCwgZGJGaWVsZF0gb2YgT2JqZWN0LmVudHJpZXMoZmllbGRzKSkge1xuICAgICAgICAgIGlmIChqc0ZpZWxkIGluIGhhYml0RGF0YSkge1xuICAgICAgICAgICAgdXBkYXRlcy5wdXNoKGAke2RiRmllbGR9ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgICAgdmFsdWVzLnB1c2goaGFiaXREYXRhW2pzRmllbGRdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgaGFiaXRzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY29tcGxldGVIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydjb21wbGV0ZWQnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjb21wbGV0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmYWlsSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsnZmFpbGVkJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZmFpbEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyByZXNldEhhYml0U3RhdHVzKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ3BlbmRpbmcnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiByZXNldEhhYml0U3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBpbmNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gRmlyc3QgZ2V0IHRoZSBjdXJyZW50IGhhYml0IHRvIGNoZWNrIHRoZSB0eXBlIGFuZCBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFiaXRSZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IGhhYml0UmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGhhYml0LnZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG1heFZhbHVlID0gaGFiaXQubWF4X3ZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5taW4oY3VycmVudFZhbHVlICsgMSwgbWF4VmFsdWUpO1xuICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAkMSwgc3RhdHVzID0gJDIgV0hFUkUgaWQgPSAkMyBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW25ld1ZhbHVlLCBuZXdTdGF0dXMsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghdXBkYXRlZEhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBpbmNyZW1lbnRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVjcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEZpcnN0IGdldCB0aGUgY3VycmVudCBoYWJpdCB0byBjaGVjayB0aGUgdHlwZSBhbmQgZ2V0IHRoZSBjdXJyZW50IHZhbHVlXG4gICAgICAgIGNvbnN0IGhhYml0UmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdFJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBoYWJpdC52YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IGhhYml0Lm1heF92YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWF4KGN1cnJlbnRWYWx1ZSAtIDEsIDApO1xuICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAkMSwgc3RhdHVzID0gJDIgV0hFUkUgaWQgPSAkMyBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW25ld1ZhbHVlLCBuZXdTdGF0dXMsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghdXBkYXRlZEhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWNyZW1lbnRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIE5vdGUgbWV0aG9kc1xuICAgIGFzeW5jIGdldE5vdGVzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSBub3RlcyBPUkRFUiBCWSBjcmVhdGVkX2F0IERFU0MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0Tm90ZXM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhgRmV0Y2hpbmcgbm90ZSBmb3IgY2F0ZWdvcnk6ICR7Y2F0ZWdvcnl9YCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gbm90ZXMgV0hFUkUgTE9XRVIoY2F0ZWdvcnkpID0gTE9XRVIoJDEpJyxcbiAgICAgICAgICBbY2F0ZWdvcnldXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZ2V0Tm90ZUJ5Q2F0ZWdvcnkgZm9yICR7Y2F0ZWdvcnl9OmAsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlJZChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBub3RlcyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0Tm90ZUJ5SWQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZU5vdGUobm90ZURhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIGlmIG5vdGUgd2l0aCB0aGlzIGNhdGVnb3J5IGFscmVhZHkgZXhpc3RzXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTm90ZSA9IGF3YWl0IHRoaXMuZ2V0Tm90ZUJ5Q2F0ZWdvcnkobm90ZURhdGEuY2F0ZWdvcnkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGV4aXN0aW5nTm90ZSkge1xuICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyBub3RlXG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlTm90ZShleGlzdGluZ05vdGUuaWQsIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IG5vdGVEYXRhLmNvbnRlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBub3RlIGlmIG5vbmUgZXhpc3RzXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIG5vdGVzIChjYXRlZ29yeSwgY29udGVudCwgY3JlYXRlZF9hdCkgVkFMVUVTICgkMSwgJDIsICQzKSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgbm90ZURhdGEuY2F0ZWdvcnksXG4gICAgICAgICAgICBub3RlRGF0YS5jb250ZW50LFxuICAgICAgICAgICAgbm90ZURhdGEuY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlTm90ZShpZCwgbm90ZURhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NhdGVnb3J5JyBpbiBub3RlRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY2F0ZWdvcnkgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gobm90ZURhdGEuY2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NvbnRlbnQnIGluIG5vdGVEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjb250ZW50ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG5vdGVEYXRhLmNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIG5vdGVzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVOb3RlKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSBub3RlcyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gRGFpbHkgZGF0YSBsb2dnaW5nXG4gICAgYXN5bmMgbG9nRGFpbHlEYXRhKGRhdGVTdHIsIHJlc2V0SGFiaXRzID0gdHJ1ZSkge1xuICAgICAgaWYgKHJlc2V0SGFiaXRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGJvb2xlYW4gaGFiaXRzIHRvIHBlbmRpbmdcbiAgICAgICAgICBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICAgXCJVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAncGVuZGluZycgV0hFUkUgdHlwZSA9ICdib29sZWFuJ1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZXNldCBhbGwgY291bnRlciBoYWJpdHMgdG8gMFxuICAgICAgICAgIGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgICBcIlVQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gMCwgc3RhdHVzID0gJ3BlbmRpbmcnIFdIRVJFIHR5cGUgPSAnY291bnRlcidcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gbG9nRGFpbHlEYXRhOicsIGVycm9yKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBTZXR0aW5nc1xuICAgIGFzeW5jIGdldERheVN0YXJ0VGltZSgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEdldCB0aGUgc2V0dGluZyBmcm9tIGEgc2V0dGluZ3MgdGFibGUgb3IgcmV0dXJuIGRlZmF1bHRcbiAgICAgICAgcmV0dXJuICcwNDowMCc7IC8vIERlZmF1bHQgdG8gNCBBTVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0RGF5U3RhcnRUaW1lOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuICcwNDowMCc7IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHNldERheVN0YXJ0VGltZSh0aW1lKSB7XG4gICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHNhdmUgdG8gZGF0YWJhc2VcbiAgICAgIHJldHVybiB0aW1lO1xuICAgIH1cbiAgfTtcbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBoYWJpdCBpcyBhY3RpdmUgdG9kYXlcbmZ1bmN0aW9uIGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdCkge1xuICBpZiAoIWhhYml0LnJlcGVhdF90eXBlKSByZXR1cm4gdHJ1ZTtcbiAgXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5T2ZXZWVrID0gdG9kYXkuZ2V0RGF5KCk7IC8vIDAgPSBTdW5kYXksIDEgPSBNb25kYXksIGV0Yy5cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRfdHlwZSA9PT0gJ2RhaWx5Jykge1xuICAgIC8vIEZvciBkYWlseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgZXZlcnkgZGF5IG9yIG9ubHkgb24gc3BlY2lmaWMgZGF5c1xuICAgIGlmIChoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDb252ZXJ0IHJlcGVhdF9kYXlzIHRvIGFycmF5IGlmIGl0J3MgYSBzdHJpbmdcbiAgICBjb25zdCByZXBlYXREYXlzID0gdHlwZW9mIGhhYml0LnJlcGVhdF9kYXlzID09PSAnc3RyaW5nJyBcbiAgICAgID8gaGFiaXQucmVwZWF0X2RheXMuc3BsaXQoJywnKSBcbiAgICAgIDogaGFiaXQucmVwZWF0X2RheXM7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIHJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICBpZiAoaGFiaXQucmVwZWF0X3R5cGUgPT09ICd3ZWVrbHknKSB7XG4gICAgLy8gRm9yIHdlZWtseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgb24gdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICBpZiAoaGFiaXQucmVwZWF0X2RheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ29udmVydCByZXBlYXRfZGF5cyB0byBhcnJheSBpZiBpdCdzIGEgc3RyaW5nXG4gICAgY29uc3QgcmVwZWF0RGF5cyA9IHR5cGVvZiBoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJ3N0cmluZycgXG4gICAgICA/IGhhYml0LnJlcGVhdF9kYXlzLnNwbGl0KCcsJykgXG4gICAgICA6IGhhYml0LnJlcGVhdF9kYXlzO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiByZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgcGdTdG9yYWdlID0gY3JlYXRlUGdTdG9yYWdlKCk7IiwgIi8qKlxuICogU3RvcmFnZSBpbnRlcmZhY2UgZm9yIEFQSSBoYW5kbGVyc1xuICogVGhpcyBmaWxlIHNlcnZlcyBhcyB0aGUgY2VudHJhbCBkYXRhIGFjY2VzcyBsYXllciBmb3IgdGhlIEFQSVxuICogXG4gKiBUaGlzIGZpbGUgdXNlcyB0aGUgUG9zdGdyZVNRTCBzdG9yYWdlIGltcGxlbWVudGF0aW9uIGZvciBwcm9kdWN0aW9uIGVudmlyb25tZW50c1xuICogYW5kIGZhbGxzIGJhY2sgdG8gaW4tbWVtb3J5IHN0b3JhZ2UgZm9yIGRldmVsb3BtZW50IGlmIERBVEFCQVNFX1VSTCBpcyBub3Qgc2V0LlxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEltcG9ydCBib3RoIHN0b3JhZ2UgaW1wbGVtZW50YXRpb25zXG5pbXBvcnQgeyBuZXRsaWZ5U3RvcmFnZSB9IGZyb20gJy4vbmV0bGlmeS1hZGFwdGVyJztcbmltcG9ydCB7IHBnU3RvcmFnZSB9IGZyb20gJy4vcGctbmV0bGlmeS1hZGFwdGVyJztcblxuLy8gRGVjaWRlIHdoaWNoIHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gdG8gdXNlIGJhc2VkIG9uIGVudmlyb25tZW50XG5sZXQgc2VsZWN0ZWRTdG9yYWdlO1xuXG4vLyBQcm9kdWN0aW9uIG1vZGUgd2l0aCBEQVRBQkFTRV9VUkwgLSB1c2UgUG9zdGdyZXNcbmlmIChwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwpIHtcbiAgY29uc29sZS5sb2coJ1VzaW5nIFBvc3RncmVTUUwgc3RvcmFnZSBmb3IgTmV0bGlmeSBGdW5jdGlvbnMnKTtcbiAgc2VsZWN0ZWRTdG9yYWdlID0gcGdTdG9yYWdlO1xufSBcbi8vIEZhbGxiYWNrIHRvIGluLW1lbW9yeSBzdG9yYWdlXG5lbHNlIHtcbiAgY29uc29sZS5sb2coJ0RBVEFCQVNFX1VSTCBub3QgZm91bmQsIHVzaW5nIGluLW1lbW9yeSBzdG9yYWdlIChub3QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24pJyk7XG4gIHNlbGVjdGVkU3RvcmFnZSA9IG5ldGxpZnlTdG9yYWdlO1xufVxuXG4vKipcbiAqIFRoZSB1bmlmaWVkIHN0b3JhZ2UgaW50ZXJmYWNlIHRoYXQncyB1c2VkIGFjcm9zcyBhbGwgQVBJIGhhbmRsZXJzXG4gKiBUaGlzIGFic3RyYWN0cyBhd2F5IHRoZSBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIGFuZCBwcm92aWRlcyBhIGNvbnNpc3RlbnQgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjb25zdCBzdG9yYWdlID0gc2VsZWN0ZWRTdG9yYWdlOyIsICIvKipcbiAqIEVycm9yIEhhbmRsaW5nIFV0aWxpdGllcyBmb3IgTmV0bGlmeSBGdW5jdGlvbnNcbiAqIFxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgdXRpbGl0eSBmdW5jdGlvbnMgZm9yIHN0YW5kYXJkaXplZCBlcnJvciBoYW5kbGluZ1xuICogYWNyb3NzIGFsbCBBUEkgZW5kcG9pbnRzLCBtYWtpbmcgaXQgZWFzaWVyIHRvIG1haW50YWluIGNvbnNpc3RlbnQgZXJyb3IgcmVzcG9uc2VzLlxuICogVGhlc2UgdXRpbGl0aWVzIGFyZSBjb21wYXRpYmxlIHdpdGggYm90aCBFeHByZXNzLXN0eWxlIGhhbmRsZXJzIGFuZCBtb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbnMuXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqIFxuICogVGhpcyBhbHNvIHNlcnZlcyBhcyBhIGRlYnVnZ2luZyBlbmRwb2ludCBmb3IgdGhlIGVycm9yLWhhbmRsZXIgbW9kdWxlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgY29uc29sZS5sb2coJ0Vycm9yIGhhbmRsZXIgbW9kdWxlIGFjY2Vzc2VkIGRpcmVjdGx5Jyk7XG4gIGNvbnNvbGUubG9nKCdEQVRBQkFTRV9VUkwgYXZhaWxhYmxlOicsIHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCA/ICdZZXMgKGxlbmd0aDogJyArIHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTC5sZW5ndGggKyAnKScgOiAnTm8nKTtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gd2l0aEVycm9ySGFuZGxlcihoYW5kbGVyKSB7XG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICB0cnkge1xuICAgICAgLy8gU2V0IEpTT04gcGFyc2luZyBmb3IgYWxsIHJlcXVlc3RzXG4gICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcgJiYgcmVxLmJvZHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXEuYm9keSA9IHt9O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDYWxsIHRoZSBvcmlnaW5hbCBoYW5kbGVyXG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlcihyZXEsIHJlcyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEFQSSBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgXG4gICAgICAvLyBEZXRlcm1pbmUgc3RhdHVzIGNvZGUgYmFzZWQgb24gZXJyb3IgbWVzc2FnZVxuICAgICAgbGV0IHN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnbm90IGZvdW5kJykpIHN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICBlbHNlIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdyZXF1aXJlZCcpIHx8IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ0ludmFsaWQnKSkgc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgIGVsc2UgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ3VuYXV0aG9yaXplZCcpIHx8IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2ZvcmJpZGRlbicpKSBzdGF0dXNDb2RlID0gNDAzO1xuICAgICAgXG4gICAgICAvLyBSZXR1cm4gYSBzdGFuZGFyZGl6ZWQgZXJyb3IgcmVzcG9uc2VcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKHN0YXR1c0NvZGUpLmpzb24oe1xuICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyByZXF1aXJlZCBmaWVsZHMgaW4gdGhlIHJlcXVlc3QgYm9keVxuICogQHBhcmFtIHtPYmplY3R9IHJlcSBFeHByZXNzIHJlcXVlc3Qgb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IHJlcXVpcmVkRmllbGRzIEFycmF5IG9mIHJlcXVpcmVkIGZpZWxkIG5hbWVzXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgYW55IHJlcXVpcmVkIGZpZWxkcyBhcmUgbWlzc2luZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVSZXF1aXJlZEZpZWxkcyhyZXEsIHJlcXVpcmVkRmllbGRzKSB7XG4gIGlmICghcmVxLmJvZHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVlc3QgYm9keSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIFxuICBjb25zdCBtaXNzaW5nRmllbGRzID0gcmVxdWlyZWRGaWVsZHMuZmlsdGVyKGZpZWxkID0+ICFyZXEuYm9keS5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpO1xuICBcbiAgaWYgKG1pc3NpbmdGaWVsZHMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyByZXF1aXJlZCBmaWVsZHM6ICR7bWlzc2luZ0ZpZWxkcy5qb2luKCcsICcpfWApO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIGFuIElEIHBhcmFtZXRlciBmcm9tIFVSTFxuICogQHBhcmFtIHtPYmplY3R9IHJlcSBFeHByZXNzIHJlcXVlc3Qgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1OYW1lIFRoZSBuYW1lIG9mIHRoZSBJRCBwYXJhbWV0ZXIgKGRlZmF1bHRzIHRvICdpZCcpXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgcGFyc2VkIElEXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIElEIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlSWQocmVxLCBwYXJhbU5hbWUgPSAnaWQnKSB7XG4gIGNvbnN0IGlkID0gcGFyc2VJbnQocmVxLnBhcmFtc1twYXJhbU5hbWVdKTtcbiAgXG4gIGlmIChpc05hTihpZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgJHtwYXJhbU5hbWV9IHBhcmFtZXRlci4gRXhwZWN0ZWQgYSBudW1iZXIuYCk7XG4gIH1cbiAgXG4gIHJldHVybiBpZDtcbn0iLCAiLy8gQVBJIGVuZHBvaW50IGZvciBtYW5hZ2luZyBpbmRpdmlkdWFsIGhhYml0c1xuaW1wb3J0IHsgc3RvcmFnZSB9IGZyb20gJy4uL19zdG9yYWdlJztcbmltcG9ydCB7IHdpdGhFcnJvckhhbmRsZXIsIHZhbGlkYXRlSWQgfSBmcm9tICcuLi9fZXJyb3ItaGFuZGxlcic7XG5cbmFzeW5jIGZ1bmN0aW9uIGhhYml0SGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBHZXQgdGhlIGhhYml0IElEIGZyb20gdGhlIFVSTCBwYXJhbWV0ZXJcbiAgY29uc3QgaWQgPSB2YWxpZGF0ZUlkKHJlcSk7XG4gIFxuICAvLyBHRVQgLSBSZXRyaWV2ZSBhIHNwZWNpZmljIGhhYml0XG4gIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGF3YWl0IHN0b3JhZ2UuZ2V0SGFiaXQoaWQpO1xuICAgICAgXG4gICAgICBpZiAoIWhhYml0KSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IFxuICAgICAgICAgIGVycm9yOiB0cnVlLCBcbiAgICAgICAgICBtZXNzYWdlOiBgSGFiaXQgd2l0aCBJRCAke2lkfSBub3QgZm91bmRgIFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKGhhYml0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciByZXRyaWV2aW5nIGhhYml0OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBQQVRDSCAtIFVwZGF0ZSBhIHNwZWNpZmljIGhhYml0XG4gIGlmIChyZXEubWV0aG9kID09PSAnUEFUQ0gnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHVwZGF0ZXMgPSByZXEuYm9keTtcbiAgICAgIFxuICAgICAgLy8gQWRkIHVwZGF0ZWRBdCB0aW1lc3RhbXBcbiAgICAgIHVwZGF0ZXMudXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSBhd2FpdCBzdG9yYWdlLnVwZGF0ZUhhYml0KGlkLCB1cGRhdGVzKTtcbiAgICAgIFxuICAgICAgaWYgKCF1cGRhdGVkSGFiaXQpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgXG4gICAgICAgICAgZXJyb3I6IHRydWUsIFxuICAgICAgICAgIG1lc3NhZ2U6IGBIYWJpdCB3aXRoIElEICR7aWR9IG5vdCBmb3VuZGAgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24odXBkYXRlZEhhYml0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB1cGRhdGluZyBoYWJpdDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gREVMRVRFIC0gRGVsZXRlIGEgc3BlY2lmaWMgaGFiaXRcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdERUxFVEUnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBzdG9yYWdlLmRlbGV0ZUhhYml0KGlkKTtcbiAgICAgIFxuICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IFxuICAgICAgICAgIGVycm9yOiB0cnVlLCBcbiAgICAgICAgICBtZXNzYWdlOiBgSGFiaXQgd2l0aCBJRCAke2lkfSBub3QgZm91bmRgIFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICBtZXNzYWdlOiBgSGFiaXQgd2l0aCBJRCAke2lkfSBkZWxldGVkIHN1Y2Nlc3NmdWxseWAgXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBkZWxldGluZyBoYWJpdDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gTWV0aG9kIG5vdCBhbGxvd2VkXG4gIHJlcy5zZXRIZWFkZXIoJ0FsbG93JywgWydHRVQnLCAnUEFUQ0gnLCAnREVMRVRFJ10pO1xuICByZXMuc3RhdHVzKDQwNSkuanNvbih7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiBgTWV0aG9kICR7cmVxLm1ldGhvZH0gTm90IEFsbG93ZWRgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB3aXRoRXJyb3JIYW5kbGVyKGhhYml0SGFuZGxlcik7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUNBLFNBQVMsZUFBZTs7O0FDdUJ4QixJQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixJQUFNLFlBQVksb0JBQUksSUFBSTtBQUMxQixJQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixJQUFNLFVBQVUsb0JBQUksSUFBSTtBQUd4QixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGdCQUFnQjtBQUdwQixJQUFNLHlCQUF5QjtBQUMvQixJQUFJLGVBQWU7QUFHWixJQUFNLDBCQUEwQixNQUFNO0FBRTNDLE1BQUksU0FBUyxTQUFTLEtBQUssVUFBVSxTQUFTLEtBQUssU0FBUyxTQUFTLEdBQUc7QUFDdEUsMEJBQXNCO0FBQUEsRUFDeEI7QUFFQSxTQUFPO0FBQUE7QUFBQSxJQUVMLE1BQU0sUUFBUSxJQUFJO0FBQ2hCLGFBQU8sUUFBUSxJQUFJLEVBQUUsS0FBSztBQUFBLElBQzVCO0FBQUEsSUFFQSxNQUFNLGtCQUFrQixVQUFVO0FBRWhDLGlCQUFXLFFBQVEsUUFBUSxPQUFPLEdBQUc7QUFDbkMsWUFBSSxLQUFLLFNBQVMsWUFBWSxNQUFNLFNB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
