
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/analytics/index.js
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

// netlify/api/analytics.js
async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const date = req.query.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return res.status(200).json({
        date,
        message: "Analytics feature is currently under development. Check back soon!",
        summary: {
          habitsCompleted: 0,
          habitsFailed: 0,
          tasksCompleted: 0
        }
      });
    } catch (error) {
      throw new Error(`Error retrieving analytics: ${error.message}`);
    }
  }
  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

// netlify/functions/analytics/index.js
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
  await handler(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var analytics_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/analytics"
};
export {
  config,
  analytics_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvYW5hbHl0aWNzL2luZGV4LmpzIiwgIm5ldGxpZnkvYXBpL25ldGxpZnktYWRhcHRlci5qcyIsICJuZXRsaWZ5L2FwaS9wZy1uZXRsaWZ5LWFkYXB0ZXIuanMiLCAibmV0bGlmeS9hcGkvX3N0b3JhZ2UuanMiLCAibmV0bGlmeS9hcGkvYW5hbHl0aWNzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBNb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIGZvciBhbmFseXRpY3MgQVBJXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xuLy8gRml4OiBVc2UgYWJzb2x1dGUgcGF0aCByZWZlcmVuY2UgZm9yIHJlbGlhYmxlIGltcG9ydHNcbmltcG9ydCBvcmlnaW5hbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL25ldGxpZnkvYXBpL2FuYWx5dGljcy5qc1wiO1xuXG4vLyBFeHByZXNzIGFkYXB0ZXIgdG8gY29udmVydCBSZXF1ZXN0L1Jlc3BvbnNlIG9iamVjdHNcbmNvbnN0IGV4cHJlc3NUb05ldGxpZnkgPSBhc3luYyAocmVxLCBjb250ZXh0KSA9PiB7XG4gIC8vIE1vY2sgRXhwcmVzcy1saWtlIG9iamVjdHNcbiAgY29uc3QgbW9ja1JlcSA9IHtcbiAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgdXJsOiByZXEudXJsLFxuICAgIHBhdGg6IG5ldyBVUkwocmVxLnVybCkucGF0aG5hbWUsXG4gICAgcXVlcnk6IE9iamVjdC5mcm9tRW50cmllcyhuZXcgVVJMKHJlcS51cmwpLnNlYXJjaFBhcmFtcyksXG4gICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzKSxcbiAgICBib2R5OiByZXEuYm9keSA/IGF3YWl0IHJlcS5qc29uKCkgOiB1bmRlZmluZWQsXG4gICAgcGFyYW1zOiBjb250ZXh0LnBhcmFtcyB8fCB7fVxuICB9O1xuICBcbiAgbGV0IHN0YXR1c0NvZGUgPSAyMDA7XG4gIGxldCByZXNwb25zZUJvZHkgPSB7fTtcbiAgbGV0IHJlc3BvbnNlSGVhZGVycyA9IHt9O1xuICBcbiAgLy8gTW9jayBFeHByZXNzIHJlc3BvbnNlXG4gIGNvbnN0IG1vY2tSZXMgPSB7XG4gICAgc3RhdHVzOiAoY29kZSkgPT4ge1xuICAgICAgc3RhdHVzQ29kZSA9IGNvZGU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGpzb246IChib2R5KSA9PiB7XG4gICAgICByZXNwb25zZUJvZHkgPSBib2R5O1xuICAgICAgcmVzcG9uc2VIZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2VuZDogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIHNldEhlYWRlcjogKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICByZXNwb25zZUhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0OiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBlbmQ6ICgpID0+IHt9XG4gIH07XG4gIFxuICAvLyBDYWxsIHRoZSBvcmlnaW5hbCBFeHByZXNzIGhhbmRsZXJcbiAgYXdhaXQgb3JpZ2luYWxIYW5kbGVyKG1vY2tSZXEsIG1vY2tSZXMpO1xuICBcbiAgLy8gQ29udmVydCB0byBOZXRsaWZ5IFJlc3BvbnNlXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgdHlwZW9mIHJlc3BvbnNlQm9keSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShyZXNwb25zZUJvZHkpIDogcmVzcG9uc2VCb2R5LFxuICAgIHtcbiAgICAgIHN0YXR1czogc3RhdHVzQ29kZSxcbiAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVyc1xuICAgIH1cbiAgKTtcbn07XG5cbi8vIE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9uIGhhbmRsZXJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgcmV0dXJuIGV4cHJlc3NUb05ldGxpZnkocmVxLCBjb250ZXh0KTtcbn07XG5cbi8vIENvbmZpZ3VyZSByb3V0aW5nXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBwYXRoOiBcIi9hcGkvYW5hbHl0aWNzXCJcbn07XG4iLCAiLyoqXG4gKiBOZXRsaWZ5IEZ1bmN0aW9ucyBTdG9yYWdlIEFkYXB0ZXIgKE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9ucyBDb21wYXRpYmxlKVxuICogXG4gKiBJbi1tZW1vcnkgc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiBzcGVjaWZpY2FsbHkgb3B0aW1pemVkIGZvciBOZXRsaWZ5J3Mgc2VydmVybGVzcyBlbnZpcm9ubWVudC5cbiAqIFRoaXMgYWRhcHRlciBpcyBkZXNpZ25lZCB0byB3b3JrIHdpdGggdGhlIG1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9ucyBBUEkgYW5kIHByb3ZpZGVzOlxuICogXG4gKiAxLiBQZXJzaXN0ZW50IGluLW1lbW9yeSBzdG9yYWdlIGFjcm9zcyBmdW5jdGlvbiBpbnZvY2F0aW9ucyAod2l0aGluIHRoZSBzYW1lIGZ1bmN0aW9uIGluc3RhbmNlKVxuICogMi4gQ29tcGF0aWJpbGl0eSB3aXRoIE5ldGxpZnkncyByZWFkLW9ubHkgZmlsZXN5c3RlbVxuICogMy4gQXV0b21hdGljIGluaXRpYWxpemF0aW9uIHdpdGggZGVmYXVsdCBkYXRhXG4gKiA0LiBDb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3RvcmFnZSBpbnRlcmZhY2VcbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbi1tZW1vcnkgc3RvcmFnZSBtYXBzXG5jb25zdCB0YXNrc01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IGhhYml0c01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IG5vdGVzTWFwID0gbmV3IE1hcCgpO1xuY29uc3QgdXNlck1hcCA9IG5ldyBNYXAoKTtcblxuLy8gQ291bnRlciBmb3IgZ2VuZXJhdGluZyBJRHNcbmxldCB0YXNrQ3VycmVudElkID0gMTtcbmxldCBoYWJpdEN1cnJlbnRJZCA9IDE7XG5sZXQgbm90ZUN1cnJlbnRJZCA9IDE7XG5sZXQgdXNlckN1cnJlbnRJZCA9IDE7XG5cbi8vIERheSBzdGFydCB0aW1lIHNldHRpbmdcbmNvbnN0IERFRkFVTFRfREFZX1NUQVJUX1RJTUUgPSAnMDQ6MDAnOyAvLyA0IEFNIGRlZmF1bHRcbmxldCBkYXlTdGFydFRpbWUgPSBERUZBVUxUX0RBWV9TVEFSVF9USU1FO1xuXG4vLyBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2ZXJsZXNzU3RvcmFnZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHQgZGF0YVxuICBpZiAodGFza3NNYXAuc2l6ZSA9PT0gMCAmJiBoYWJpdHNNYXAuc2l6ZSA9PT0gMCAmJiBub3Rlc01hcC5zaXplID09PSAwKSB7XG4gICAgaW5pdGlhbGl6ZURlZmF1bHREYXRhKCk7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgLy8gVXNlciBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VXNlcihpZCkge1xuICAgICAgcmV0dXJuIHVzZXJNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgICAgIC8vIEZpbmQgdGhlIHVzZXIgd2l0aCB0aGUgZ2l2ZW4gdXNlcm5hbWVcbiAgICAgIGZvciAoY29uc3QgdXNlciBvZiB1c2VyTWFwLnZhbHVlcygpKSB7XG4gICAgICAgIGlmICh1c2VyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKCkgPT09IHVzZXJuYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVVc2VyKHVzZXJEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IHVzZXJDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IHVzZXIgPSB7IFxuICAgICAgICAuLi51c2VyRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICB1c2VyTWFwLnNldChpZCwgdXNlcik7XG4gICAgICByZXR1cm4gdXNlcjtcbiAgICB9LFxuICAgIFxuICAgIC8vIFRhc2sgbWV0aG9kc1xuICAgIGFzeW5jIGdldFRhc2tzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGFza3NNYXAudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgLy8gQ29tcGxldGVkIHRhc2tzIHNob3VsZCBhcHBlYXIgYWZ0ZXIgbm9uLWNvbXBsZXRlZCB0YXNrc1xuICAgICAgICBpZiAoYS5jb21wbGV0ZWQgIT09IGIuY29tcGxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIGEuY29tcGxldGVkID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNvcnQgYnkgY3JlYXRpb24gZGF0ZSAobmV3ZXN0IGZpcnN0KVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoYi5jcmVhdGVkQXQpIC0gbmV3IERhdGUoYS5jcmVhdGVkQXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRUYXNrKGlkKSB7XG4gICAgICByZXR1cm4gdGFza3NNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVGFzayh0YXNrRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSB0YXNrQ3VycmVudElkKys7XG4gICAgICBjb25zdCB0YXNrID0geyBcbiAgICAgICAgLi4udGFza0RhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgdGFza3NNYXAuc2V0KGlkLCB0YXNrKTtcbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlVGFzayhpZCwgdGFza0RhdGEpIHtcbiAgICAgIGNvbnN0IHRhc2sgPSB0YXNrc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCF0YXNrKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSB7IFxuICAgICAgICAuLi50YXNrLCBcbiAgICAgICAgLi4udGFza0RhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICB0YXNrc01hcC5zZXQoaWQsIHVwZGF0ZWRUYXNrKTtcbiAgICAgIHJldHVybiB1cGRhdGVkVGFzaztcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZVRhc2soaWQpIHtcbiAgICAgIGNvbnN0IHRhc2sgPSB0YXNrc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCF0YXNrKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIHRhc2tzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIEhhYml0IG1ldGhvZHNcbiAgICBhc3luYyBnZXRIYWJpdHMoKSB7XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgaGFiaXRzQXJyYXkgPSBBcnJheS5mcm9tKGhhYml0c01hcC52YWx1ZXMoKSk7XG4gICAgICBcbiAgICAgIC8vIEFkZCBpc0FjdGl2ZVRvZGF5IGZpZWxkIHRvIGVhY2ggaGFiaXRcbiAgICAgIHJldHVybiBoYWJpdHNBcnJheS5tYXAoaGFiaXQgPT4gKHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlSGFiaXQoaGFiaXREYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IGhhYml0Q3VycmVudElkKys7XG4gICAgICBjb25zdCBoYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0RGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJywgLy8gJ3BlbmRpbmcnLCAnY29tcGxldGVkJywgJ2ZhaWxlZCdcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCBoYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZUhhYml0KGlkLCBoYWJpdERhdGEpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICAuLi5oYWJpdERhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNvbXBsZXRlSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmYWlsSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdmYWlsZWQnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyByZXNldEhhYml0U3RhdHVzKGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGluY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0eXBlb2YgaGFiaXQuY3VycmVudFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0LmN1cnJlbnRWYWx1ZSA6IDA7XG4gICAgICBjb25zdCBtYXhWYWx1ZSA9IHR5cGVvZiBoYWJpdC5tYXhWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5tYXhWYWx1ZSA6IEluZmluaXR5O1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1pbihjdXJyZW50VmFsdWUgKyAxLCBtYXhWYWx1ZSk7XG4gICAgICBcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgY3VycmVudFZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdHlwZW9mIGhhYml0LmN1cnJlbnRWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5jdXJyZW50VmFsdWUgOiAwO1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1heChjdXJyZW50VmFsdWUgLSAxLCAwKTtcbiAgICAgIFxuICAgICAgY29uc3QgbWF4VmFsdWUgPSB0eXBlb2YgaGFiaXQubWF4VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQubWF4VmFsdWUgOiBJbmZpbml0eTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgY3VycmVudFZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIE5vdGUgbWV0aG9kc1xuICAgIGFzeW5jIGdldE5vdGVzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20obm90ZXNNYXAudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgLy8gU29ydCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShiLmNyZWF0ZWRBdCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgICAvLyBGaW5kIHRoZSBub3RlIHdpdGggdGhlIGdpdmVuIGNhdGVnb3J5IChjYXNlLWluc2Vuc2l0aXZlKVxuICAgICAgZm9yIChjb25zdCBub3RlIG9mIG5vdGVzTWFwLnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChub3RlLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCkgPT09IGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICByZXR1cm4gbm90ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVOb3RlKG5vdGVEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IG5vdGVDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IG5vdGUgPSB7IFxuICAgICAgICAuLi5ub3RlRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLnNldChpZCwgbm90ZSk7XG4gICAgICByZXR1cm4gbm90ZTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZU5vdGUoaWQsIG5vdGVEYXRhKSB7XG4gICAgICBjb25zdCBub3RlID0gbm90ZXNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghbm90ZSkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWROb3RlID0geyBcbiAgICAgICAgLi4ubm90ZSwgXG4gICAgICAgIC4uLm5vdGVEYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuc2V0KGlkLCB1cGRhdGVkTm90ZSk7XG4gICAgICByZXR1cm4gdXBkYXRlZE5vdGU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlJZChpZCkge1xuICAgICAgcmV0dXJuIG5vdGVzTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZU5vdGUoaWQpIHtcbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFub3RlKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLmRlbGV0ZShpZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIFNldHRpbmdzXG4gICAgYXN5bmMgZ2V0RGF5U3RhcnRUaW1lKCkge1xuICAgICAgcmV0dXJuIGRheVN0YXJ0VGltZSB8fCBERUZBVUxUX0RBWV9TVEFSVF9USU1FO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgc2V0RGF5U3RhcnRUaW1lKHRpbWUpIHtcbiAgICAgIGRheVN0YXJ0VGltZSA9IHRpbWU7XG4gICAgICByZXR1cm4gZGF5U3RhcnRUaW1lO1xuICAgIH0sXG4gICAgXG4gICAgLy8gRGFpbHkgZGF0YSBsb2dnaW5nXG4gICAgYXN5bmMgbG9nRGFpbHlEYXRhKGRhdGVTdHIsIHJlc2V0SGFiaXRzID0gdHJ1ZSkge1xuICAgICAgaWYgKHJlc2V0SGFiaXRzKSB7XG4gICAgICAgIC8vIFJlc2V0IGFsbCBib29sZWFuIGhhYml0cyB0byBwZW5kaW5nXG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBoYWJpdF0gb2YgaGFiaXRzTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmIChoYWJpdC50eXBlID09PSAnYm9vbGVhbicgJiYgaGFiaXQuc3RhdHVzICE9PSAncGVuZGluZycpIHtcbiAgICAgICAgICAgIGhhYml0c01hcC5zZXQoaWQsIHtcbiAgICAgICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlc2V0IGFsbCBjb3VudGVyIGhhYml0cyB0byAwXG4gICAgICAgICAgaWYgKGhhYml0LnR5cGUgPT09ICdjb3VudGVyJykge1xuICAgICAgICAgICAgaGFiaXRzTWFwLnNldChpZCwge1xuICAgICAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICAgICAgY3VycmVudFZhbHVlOiAwLFxuICAgICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgaGFiaXQgaXMgYWN0aXZlIG9uIGEgZ2l2ZW4gZGF5XG5mdW5jdGlvbiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpIHtcbiAgaWYgKCFoYWJpdC5yZXBlYXRUeXBlKSByZXR1cm4gdHJ1ZTtcbiAgXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5T2ZXZWVrID0gdG9kYXkuZ2V0RGF5KCk7IC8vIDAgPSBTdW5kYXksIDEgPSBNb25kYXksIGV0Yy5cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRUeXBlID09PSAnZGFpbHknKSB7XG4gICAgLy8gRm9yIGRhaWx5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBldmVyeSBkYXkgb3Igb25seSBvbiBzcGVjaWZpYyBkYXlzXG4gICAgaWYgKGhhYml0LnJlcGVhdERheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIGhhYml0LnJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICBpZiAoaGFiaXQucmVwZWF0VHlwZSA9PT0gJ3dlZWtseScpIHtcbiAgICAvLyBGb3Igd2Vla2x5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBvbiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIGlmIChoYWJpdC5yZXBlYXREYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiBoYWJpdC5yZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIEluaXRpYWxpemUgd2l0aCBzb21lIGV4YW1wbGUgZGF0YVxuZnVuY3Rpb24gaW5pdGlhbGl6ZURlZmF1bHREYXRhKCkge1xuICAvLyBDcmVhdGUgc29tZSBkZWZhdWx0IGhhYml0c1xuICBjb25zdCBoYWJpdDEgPSB7XG4gICAgaWQ6IGhhYml0Q3VycmVudElkKyssXG4gICAgbmFtZTogJ01vcm5pbmcgRXhlcmNpc2UnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICByZXBlYXRUeXBlOiAnZGFpbHknLFxuICAgIHJlcGVhdERheXM6ICcqJyxcbiAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3QgaGFiaXQyID0ge1xuICAgIGlkOiBoYWJpdEN1cnJlbnRJZCsrLFxuICAgIG5hbWU6ICdEcmluayB3YXRlcicsXG4gICAgdHlwZTogJ2NvdW50ZXInLFxuICAgIG1heFZhbHVlOiA4LFxuICAgIGN1cnJlbnRWYWx1ZTogMCxcbiAgICByZXBlYXRUeXBlOiAnZGFpbHknLFxuICAgIHJlcGVhdERheXM6ICcqJyxcbiAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgaGFiaXRzTWFwLnNldChoYWJpdDEuaWQsIGhhYml0MSk7XG4gIGhhYml0c01hcC5zZXQoaGFiaXQyLmlkLCBoYWJpdDIpO1xuICBcbiAgLy8gQ3JlYXRlIGRlZmF1bHQgdGFza1xuICBjb25zdCB0YXNrID0ge1xuICAgIGlkOiB0YXNrQ3VycmVudElkKyssXG4gICAgdGV4dDogJ0NyZWF0ZSBwcm9qZWN0IHBsYW4nLFxuICAgIGNvbXBsZXRlZDogZmFsc2UsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIHRhc2tzTWFwLnNldCh0YXNrLmlkLCB0YXNrKTtcbiAgXG4gIC8vIENyZWF0ZSBkZWZhdWx0IG5vdGVzXG4gIGNvbnN0IG5vdGUxID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdIZWFsdGgnLFxuICAgIGNvbnRlbnQ6ICcjIEhlYWx0aCBHb2Fsc1xcblxcbi0gSW1wcm92ZSBzbGVlcCBzY2hlZHVsZVxcbi0gRHJpbmsgbW9yZSB3YXRlclxcbi0gRXhlcmNpc2UgMyB0aW1lcyBhIHdlZWsnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlMiA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnQ2FyZWVyJyxcbiAgICBjb250ZW50OiAnIyBDYXJlZXIgTm90ZXNcXG5cXG4tIFVwZGF0ZSByZXN1bWVcXG4tIE5ldHdvcmsgd2l0aCBpbmR1c3RyeSBwcm9mZXNzaW9uYWxzXFxuLSBMZWFybiBuZXcgc2tpbGxzJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTMgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0ZpbmFuY2VzJyxcbiAgICBjb250ZW50OiAnIyBGaW5hbmNpYWwgR29hbHNcXG5cXG4tIFNhdmUgMjAlIG9mIGluY29tZVxcbi0gUmV2aWV3IGJ1ZGdldCBtb250aGx5XFxuLSBSZXNlYXJjaCBpbnZlc3RtZW50IG9wdGlvbnMnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlNCA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnUGVyc29uYWwnLFxuICAgIGNvbnRlbnQ6ICcjIFBlcnNvbmFsIERldmVsb3BtZW50XFxuXFxuLSBSZWFkIG9uZSBib29rIHBlciBtb250aFxcbi0gUHJhY3RpY2UgbWVkaXRhdGlvblxcbi0gU3BlbmQgcXVhbGl0eSB0aW1lIHdpdGggZmFtaWx5JyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgbm90ZXNNYXAuc2V0KG5vdGUxLmlkLCBub3RlMSk7XG4gIG5vdGVzTWFwLnNldChub3RlMi5pZCwgbm90ZTIpO1xuICBub3Rlc01hcC5zZXQobm90ZTMuaWQsIG5vdGUzKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGU0LmlkLCBub3RlNCk7XG59XG5cbi8vIEV4cG9ydCB0aGUgbmV0bGlmeSBzdG9yYWdlIHNpbmdsZXRvblxuZXhwb3J0IGNvbnN0IG5ldGxpZnlTdG9yYWdlID0gY3JlYXRlU2VydmVybGVzc1N0b3JhZ2UoKTsiLCAiLyoqXG4gKiBQb3N0Z3JlU1FMIEFkYXB0ZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zXG4gKiBcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIGEgUG9zdGdyZVNRTC1iYXNlZCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3RvcmFnZSBpbnRlcmZhY2VcbiAqIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucy4gSXQgY29ubmVjdHMgZGlyZWN0bHkgdG8gdGhlIFBvc3RncmVTUUwgZGF0YWJhc2UgdXNpbmdcbiAqIHRoZSBEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW1wb3J0IHRoZSBwZyBtb2R1bGVcbmltcG9ydCBwa2cgZnJvbSAncGcnO1xuY29uc3QgeyBQb29sIH0gPSBwa2c7XG5cbi8vIENyZWF0ZSBhIGNvbm5lY3Rpb24gcG9vbFxubGV0IHBvb2w7XG5cbi8vIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgUG9zdGdyZVNRTC1iYXNlZCBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3JlYXRlUGdTdG9yYWdlID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXplIHBvb2wgaWYgbm90IGFscmVhZHkgY3JlYXRlZFxuICBpZiAoIXBvb2wpIHtcbiAgICBjb25zdCBkYXRhYmFzZVVybCA9IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTDtcbiAgICBcbiAgICBpZiAoIWRhdGFiYXNlVXJsKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFUlJPUjogREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG1pc3NpbmcnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEluaXRpYWxpemluZyBQb3N0Z3JlU1FMIGNvbm5lY3Rpb24gKFVSTCBsZW5ndGg6ICR7ZGF0YWJhc2VVcmwubGVuZ3RofSlgKTtcbiAgICBcbiAgICBwb29sID0gbmV3IFBvb2woe1xuICAgICAgY29ubmVjdGlvblN0cmluZzogZGF0YWJhc2VVcmwsXG4gICAgICAvLyBFbmFibGUgU1NMIHdpdGggcmVqZWN0VW5hdXRob3JpemVkIHNldCB0byBmYWxzZSBmb3IgTmV0bGlmeVxuICAgICAgc3NsOiB7XG4gICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRlc3QgdGhlIGNvbm5lY3Rpb25cbiAgICBwb29sLnF1ZXJ5KCdTRUxFQ1QgTk9XKCknKVxuICAgICAgLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Bvc3RncmVTUUwgZGF0YWJhc2UgY29ubmVjdGlvbiBzdWNjZXNzZnVsJykpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUG9zdGdyZVNRTCBjb25uZWN0aW9uIGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyLnN0YWNrKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBVc2VyIG1ldGhvZHNcbiAgICBhc3luYyBnZXRVc2VyKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRVc2VyOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSB1c2VybmFtZSA9ICQxJyxcbiAgICAgICAgICBbdXNlcm5hbWVdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VXNlckJ5VXNlcm5hbWU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVVzZXIodXNlckRhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIHVzZXJzICh1c2VybmFtZSwgcGFzc3dvcmQpIFZBTFVFUyAoJDEsICQyKSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW3VzZXJEYXRhLnVzZXJuYW1lLCB1c2VyRGF0YS5wYXNzd29yZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlVXNlcjonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gVGFzayBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VGFza3MoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIHRhc2tzIE9SREVSIEJZIGNvbXBsZXRlZCBBU0MsIGNyZWF0ZWRfYXQgREVTQycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRUYXNrczonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VGFzayhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB0YXNrcyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVGFzayh0YXNrRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIHRhc2sgd2l0aCBkYXRhOicsIEpTT04uc3RyaW5naWZ5KHRhc2tEYXRhKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBFeHRyYWN0IHRhc2sgcHJvcGVydGllcyB3aXRoIGRlZmF1bHRzXG4gICAgICAgIGNvbnN0IHRleHQgPSB0YXNrRGF0YS50ZXh0O1xuICAgICAgICBjb25zdCBjb21wbGV0ZWQgPSB0YXNrRGF0YS5jb21wbGV0ZWQgfHwgZmFsc2U7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IHRhc2tEYXRhLmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRhc2tEYXRhLnVzZXJJZCB8fCBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gdGFza3MgKHRleHQsIGNvbXBsZXRlZCwgY3JlYXRlZF9hdCwgdXNlcl9pZCkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCkgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFt0ZXh0LCBjb21wbGV0ZWQsIGNyZWF0ZWRBdCwgdXNlcklkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGV0YWlsczonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyb3Iuc3RhY2spO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZVRhc2soaWQsIHRhc2tEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCd0ZXh0JyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgdGV4dCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjb21wbGV0ZWQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjb21wbGV0ZWQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEuY29tcGxldGVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjcmVhdGVkQXQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjcmVhdGVkX2F0ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgndXNlcklkJyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgdXNlcl9pZCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS51c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIHRhc2tzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVUYXNrKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSB0YXNrcyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gSGFiaXQgbWV0aG9kc1xuICAgIGFzeW5jIGdldEhhYml0cygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gaGFiaXRzJyk7XG4gICAgICAgIGNvbnN0IGhhYml0cyA9IHJlc3VsdC5yb3dzO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIGlzQWN0aXZlVG9kYXkgZmllbGQgdG8gZWFjaCBoYWJpdFxuICAgICAgICByZXR1cm4gaGFiaXRzLm1hcChoYWJpdCA9PiAoe1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfSkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0SGFiaXRzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVIYWJpdChoYWJpdERhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENvbnZlcnQgYXJyYXkgdG8gc3RyaW5nIGZvciBkYXRhYmFzZSBzdG9yYWdlIGlmIG5lZWRlZFxuICAgICAgICBsZXQgcmVwZWF0RGF5cyA9IGhhYml0RGF0YS5yZXBlYXREYXlzO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXBlYXREYXlzKSkge1xuICAgICAgICAgIHJlcGVhdERheXMgPSByZXBlYXREYXlzLmpvaW4oJywnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICBgSU5TRVJUIElOVE8gaGFiaXRzIChcbiAgICAgICAgICAgIG5hbWUsIHR5cGUsIHZhbHVlLCBtYXhfdmFsdWUsIHN0YXR1cywgcmVwZWF0X3R5cGUsIHJlcGVhdF9kYXlzLCB1c2VyX2lkLCBsYXN0X3Jlc2V0XG4gICAgICAgICAgKSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3LCAkOCwgJDkpIFJFVFVSTklORyAqYCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBoYWJpdERhdGEubmFtZSxcbiAgICAgICAgICAgIGhhYml0RGF0YS50eXBlIHx8ICdib29sZWFuJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS52YWx1ZSB8fCAwLFxuICAgICAgICAgICAgaGFiaXREYXRhLm1heFZhbHVlIHx8IDAsXG4gICAgICAgICAgICBoYWJpdERhdGEuc3RhdHVzIHx8ICdwZW5kaW5nJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS5yZXBlYXRUeXBlIHx8ICdkYWlseScsXG4gICAgICAgICAgICByZXBlYXREYXlzIHx8ICcqJyxcbiAgICAgICAgICAgIGhhYml0RGF0YS51c2VySWQgfHwgbnVsbCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5sYXN0UmVzZXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlSGFiaXQoaWQsIGhhYml0RGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZXBlYXREYXlzIHNwZWNpYWxseSAtIGNvbnZlcnQgYXJyYXkgdG8gc3RyaW5nXG4gICAgICAgIGlmICgncmVwZWF0RGF5cycgaW4gaGFiaXREYXRhKSB7XG4gICAgICAgICAgbGV0IHJlcGVhdERheXMgPSBoYWJpdERhdGEucmVwZWF0RGF5cztcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXBlYXREYXlzKSkge1xuICAgICAgICAgICAgcmVwZWF0RGF5cyA9IHJlcGVhdERheXMuam9pbignLCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHJlcGVhdF9kYXlzID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHJlcGVhdERheXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmaWVsZHMgPSB7XG4gICAgICAgICAgbmFtZTogJ25hbWUnLFxuICAgICAgICAgIHR5cGU6ICd0eXBlJyxcbiAgICAgICAgICB2YWx1ZTogJ3ZhbHVlJyxcbiAgICAgICAgICBtYXhWYWx1ZTogJ21heF92YWx1ZScsXG4gICAgICAgICAgc3RhdHVzOiAnc3RhdHVzJyxcbiAgICAgICAgICByZXBlYXRUeXBlOiAncmVwZWF0X3R5cGUnLFxuICAgICAgICAgIHVzZXJJZDogJ3VzZXJfaWQnLFxuICAgICAgICAgIGxhc3RSZXNldDogJ2xhc3RfcmVzZXQnXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgYWxsIHRoZSBvdGhlciBmaWVsZHNcbiAgICAgICAgZm9yIChjb25zdCBbanNGaWVsZCwgZGJGaWVsZF0gb2YgT2JqZWN0LmVudHJpZXMoZmllbGRzKSkge1xuICAgICAgICAgIGlmIChqc0ZpZWxkIGluIGhhYml0RGF0YSkge1xuICAgICAgICAgICAgdXBkYXRlcy5wdXNoKGAke2RiRmllbGR9ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgICAgdmFsdWVzLnB1c2goaGFiaXREYXRhW2pzRmllbGRdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgaGFiaXRzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY29tcGxldGVIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydjb21wbGV0ZWQnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjb21wbGV0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmYWlsSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsnZmFpbGVkJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZmFpbEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyByZXNldEhhYml0U3RhdHVzKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ3BlbmRpbmcnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiByZXNldEhhYml0U3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBpbmNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gRmlyc3QgZ2V0IHRoZSBjdXJyZW50IGhhYml0IHRvIGNoZWNrIHRoZSB0eXBlIGFuZCBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFiaXRSZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IGhhYml0UmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGhhYml0LnZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG1heFZhbHVlID0gaGFiaXQubWF4X3ZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5taW4oY3VycmVudFZhbHVlICsgMSwgbWF4VmFsdWUpO1xuICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAkMSwgc3RhdHVzID0gJDIgV0hFUkUgaWQgPSAkMyBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW25ld1ZhbHVlLCBuZXdTdGF0dXMsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghdXBkYXRlZEhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBpbmNyZW1lbnRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVjcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEZpcnN0IGdldCB0aGUgY3VycmVudCBoYWJpdCB0byBjaGVjayB0aGUgdHlwZSBhbmQgZ2V0IHRoZSBjdXJyZW50IHZhbHVlXG4gICAgICAgIGNvbnN0IGhhYml0UmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdFJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBoYWJpdC52YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IGhhYml0Lm1heF92YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWF4KGN1cnJlbnRWYWx1ZSAtIDEsIDApO1xuICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAkMSwgc3RhdHVzID0gJDIgV0hFUkUgaWQgPSAkMyBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW25ld1ZhbHVlLCBuZXdTdGF0dXMsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghdXBkYXRlZEhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWNyZW1lbnRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIE5vdGUgbWV0aG9kc1xuICAgIGFzeW5jIGdldE5vdGVzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSBub3RlcyBPUkRFUiBCWSBjcmVhdGVkX2F0IERFU0MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0Tm90ZXM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhgRmV0Y2hpbmcgbm90ZSBmb3IgY2F0ZWdvcnk6ICR7Y2F0ZWdvcnl9YCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gbm90ZXMgV0hFUkUgTE9XRVIoY2F0ZWdvcnkpID0gTE9XRVIoJDEpJyxcbiAgICAgICAgICBbY2F0ZWdvcnldXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZ2V0Tm90ZUJ5Q2F0ZWdvcnkgZm9yICR7Y2F0ZWdvcnl9OmAsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlJZChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBub3RlcyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0Tm90ZUJ5SWQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZU5vdGUobm90ZURhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIGlmIG5vdGUgd2l0aCB0aGlzIGNhdGVnb3J5IGFscmVhZHkgZXhpc3RzXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTm90ZSA9IGF3YWl0IHRoaXMuZ2V0Tm90ZUJ5Q2F0ZWdvcnkobm90ZURhdGEuY2F0ZWdvcnkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGV4aXN0aW5nTm90ZSkge1xuICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyBub3RlXG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlTm90ZShleGlzdGluZ05vdGUuaWQsIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IG5vdGVEYXRhLmNvbnRlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBub3RlIGlmIG5vbmUgZXhpc3RzXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIG5vdGVzIChjYXRlZ29yeSwgY29udGVudCwgY3JlYXRlZF9hdCkgVkFMVUVTICgkMSwgJDIsICQzKSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgbm90ZURhdGEuY2F0ZWdvcnksXG4gICAgICAgICAgICBub3RlRGF0YS5jb250ZW50LFxuICAgICAgICAgICAgbm90ZURhdGEuY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlTm90ZShpZCwgbm90ZURhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NhdGVnb3J5JyBpbiBub3RlRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY2F0ZWdvcnkgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gobm90ZURhdGEuY2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NvbnRlbnQnIGluIG5vdGVEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjb250ZW50ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG5vdGVEYXRhLmNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIG5vdGVzXG4gICAgICAgICAgU0VUICR7dXBkYXRlcy5qb2luKCcsICcpfVxuICAgICAgICAgIFdIRVJFIGlkID0gJCR7dmFsdWVzLmxlbmd0aH1cbiAgICAgICAgICBSRVRVUk5JTkcgKlxuICAgICAgICBgO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShxdWVyeSwgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiB1cGRhdGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVOb3RlKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSBub3RlcyBXSEVSRSBpZCA9ICQxIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPiAwO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gRGFpbHkgZGF0YSBsb2dnaW5nXG4gICAgYXN5bmMgbG9nRGFpbHlEYXRhKGRhdGVTdHIsIHJlc2V0SGFiaXRzID0gdHJ1ZSkge1xuICAgICAgaWYgKHJlc2V0SGFiaXRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGJvb2xlYW4gaGFiaXRzIHRvIHBlbmRpbmdcbiAgICAgICAgICBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICAgXCJVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAncGVuZGluZycgV0hFUkUgdHlwZSA9ICdib29sZWFuJ1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZXNldCBhbGwgY291bnRlciBoYWJpdHMgdG8gMFxuICAgICAgICAgIGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgICBcIlVQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gMCwgc3RhdHVzID0gJ3BlbmRpbmcnIFdIRVJFIHR5cGUgPSAnY291bnRlcidcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gbG9nRGFpbHlEYXRhOicsIGVycm9yKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBTZXR0aW5nc1xuICAgIGFzeW5jIGdldERheVN0YXJ0VGltZSgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEdldCB0aGUgc2V0dGluZyBmcm9tIGEgc2V0dGluZ3MgdGFibGUgb3IgcmV0dXJuIGRlZmF1bHRcbiAgICAgICAgcmV0dXJuICcwNDowMCc7IC8vIERlZmF1bHQgdG8gNCBBTVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0RGF5U3RhcnRUaW1lOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuICcwNDowMCc7IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHNldERheVN0YXJ0VGltZSh0aW1lKSB7XG4gICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHNhdmUgdG8gZGF0YWJhc2VcbiAgICAgIHJldHVybiB0aW1lO1xuICAgIH1cbiAgfTtcbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBoYWJpdCBpcyBhY3RpdmUgdG9kYXlcbmZ1bmN0aW9uIGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdCkge1xuICBpZiAoIWhhYml0LnJlcGVhdF90eXBlKSByZXR1cm4gdHJ1ZTtcbiAgXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5T2ZXZWVrID0gdG9kYXkuZ2V0RGF5KCk7IC8vIDAgPSBTdW5kYXksIDEgPSBNb25kYXksIGV0Yy5cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRfdHlwZSA9PT0gJ2RhaWx5Jykge1xuICAgIC8vIEZvciBkYWlseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgZXZlcnkgZGF5IG9yIG9ubHkgb24gc3BlY2lmaWMgZGF5c1xuICAgIGlmIChoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDb252ZXJ0IHJlcGVhdF9kYXlzIHRvIGFycmF5IGlmIGl0J3MgYSBzdHJpbmdcbiAgICBjb25zdCByZXBlYXREYXlzID0gdHlwZW9mIGhhYml0LnJlcGVhdF9kYXlzID09PSAnc3RyaW5nJyBcbiAgICAgID8gaGFiaXQucmVwZWF0X2RheXMuc3BsaXQoJywnKSBcbiAgICAgIDogaGFiaXQucmVwZWF0X2RheXM7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIHJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICBpZiAoaGFiaXQucmVwZWF0X3R5cGUgPT09ICd3ZWVrbHknKSB7XG4gICAgLy8gRm9yIHdlZWtseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgb24gdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICBpZiAoaGFiaXQucmVwZWF0X2RheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ29udmVydCByZXBlYXRfZGF5cyB0byBhcnJheSBpZiBpdCdzIGEgc3RyaW5nXG4gICAgY29uc3QgcmVwZWF0RGF5cyA9IHR5cGVvZiBoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJ3N0cmluZycgXG4gICAgICA/IGhhYml0LnJlcGVhdF9kYXlzLnNwbGl0KCcsJykgXG4gICAgICA6IGhhYml0LnJlcGVhdF9kYXlzO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiByZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgcGdTdG9yYWdlID0gY3JlYXRlUGdTdG9yYWdlKCk7IiwgIi8qKlxuICogU3RvcmFnZSBpbnRlcmZhY2UgZm9yIEFQSSBoYW5kbGVyc1xuICogVGhpcyBmaWxlIHNlcnZlcyBhcyB0aGUgY2VudHJhbCBkYXRhIGFjY2VzcyBsYXllciBmb3IgdGhlIEFQSVxuICogXG4gKiBUaGlzIGZpbGUgdXNlcyB0aGUgUG9zdGdyZVNRTCBzdG9yYWdlIGltcGxlbWVudGF0aW9uIGZvciBwcm9kdWN0aW9uIGVudmlyb25tZW50c1xuICogYW5kIGZhbGxzIGJhY2sgdG8gaW4tbWVtb3J5IHN0b3JhZ2UgZm9yIGRldmVsb3BtZW50IGlmIERBVEFCQVNFX1VSTCBpcyBub3Qgc2V0LlxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEltcG9ydCBib3RoIHN0b3JhZ2UgaW1wbGVtZW50YXRpb25zXG5pbXBvcnQgeyBuZXRsaWZ5U3RvcmFnZSB9IGZyb20gJy4vbmV0bGlmeS1hZGFwdGVyJztcbmltcG9ydCB7IHBnU3RvcmFnZSB9IGZyb20gJy4vcGctbmV0bGlmeS1hZGFwdGVyJztcblxuLy8gRGVjaWRlIHdoaWNoIHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gdG8gdXNlIGJhc2VkIG9uIGVudmlyb25tZW50XG5sZXQgc2VsZWN0ZWRTdG9yYWdlO1xuXG4vLyBQcm9kdWN0aW9uIG1vZGUgd2l0aCBEQVRBQkFTRV9VUkwgLSB1c2UgUG9zdGdyZXNcbmlmIChwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwpIHtcbiAgY29uc29sZS5sb2coJ1VzaW5nIFBvc3RncmVTUUwgc3RvcmFnZSBmb3IgTmV0bGlmeSBGdW5jdGlvbnMnKTtcbiAgc2VsZWN0ZWRTdG9yYWdlID0gcGdTdG9yYWdlO1xufSBcbi8vIEZhbGxiYWNrIHRvIGluLW1lbW9yeSBzdG9yYWdlXG5lbHNlIHtcbiAgY29uc29sZS5sb2coJ0RBVEFCQVNFX1VSTCBub3QgZm91bmQsIHVzaW5nIGluLW1lbW9yeSBzdG9yYWdlIChub3QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24pJyk7XG4gIHNlbGVjdGVkU3RvcmFnZSA9IG5ldGxpZnlTdG9yYWdlO1xufVxuXG4vKipcbiAqIFRoZSB1bmlmaWVkIHN0b3JhZ2UgaW50ZXJmYWNlIHRoYXQncyB1c2VkIGFjcm9zcyBhbGwgQVBJIGhhbmRsZXJzXG4gKiBUaGlzIGFic3RyYWN0cyBhd2F5IHRoZSBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIGFuZCBwcm92aWRlcyBhIGNvbnNpc3RlbnQgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjb25zdCBzdG9yYWdlID0gc2VsZWN0ZWRTdG9yYWdlOyIsICIvLyBBUEkgZW5kcG9pbnQgZm9yIGRhaWx5IGFuYWx5dGljc1xuaW1wb3J0IHsgc3RvcmFnZSB9IGZyb20gJy4vX3N0b3JhZ2UnO1xuaW1wb3J0IHsgd2l0aEVycm9ySGFuZGxlciB9IGZyb20gJy4vX2Vycm9yLWhhbmRsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIC8vIEdFVCAtIFJldHJpZXZlIGFuYWx5dGljcyBmb3IgYSBzcGVjaWZpYyBkYXRlXG4gIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRlID0gcmVxLnF1ZXJ5LmRhdGUgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgICBcbiAgICAgIC8vIEZvciBub3csIGp1c3QgcmV0dXJuIGEgc2ltcGxlIHJlc3BvbnNlIHNpbmNlIHdlIGRvbid0IGhhdmUgcmVhbCBhbmFseXRpY3Mgc3RvcmFnZVxuICAgICAgLy8gSW4gYSBwcm9kdWN0aW9uIGFwcCwgdGhpcyB3b3VsZCByZXRyaWV2ZSBhY3R1YWwgYW5hbHl0aWNzIGRhdGFcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgIGRhdGUsXG4gICAgICAgIG1lc3NhZ2U6IFwiQW5hbHl0aWNzIGZlYXR1cmUgaXMgY3VycmVudGx5IHVuZGVyIGRldmVsb3BtZW50LiBDaGVjayBiYWNrIHNvb24hXCIsXG4gICAgICAgIHN1bW1hcnk6IHtcbiAgICAgICAgICBoYWJpdHNDb21wbGV0ZWQ6IDAsXG4gICAgICAgICAgaGFiaXRzRmFpbGVkOiAwLFxuICAgICAgICAgIHRhc2tzQ29tcGxldGVkOiAwXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHJldHJpZXZpbmcgYW5hbHl0aWNzOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBNZXRob2Qgbm90IGFsbG93ZWRcbiAgcmVzLnNldEhlYWRlcignQWxsb3cnLCBbJ0dFVCddKTtcbiAgcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogYE1ldGhvZCAke3JlcS5tZXRob2R9IE5vdCBBbGxvd2VkYCB9KTtcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQ0EsU0FBUyxlQUFlOzs7QUN1QnhCLElBQU0sV0FBVyxvQkFBSSxJQUFJO0FBQ3pCLElBQU0sWUFBWSxvQkFBSSxJQUFJO0FBQzFCLElBQU0sV0FBVyxvQkFBSSxJQUFJO0FBQ3pCLElBQU0sVUFBVSxvQkFBSSxJ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
