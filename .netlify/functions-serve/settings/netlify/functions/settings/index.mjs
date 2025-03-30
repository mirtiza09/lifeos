
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/settings/index.js
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
function withErrorHandler(handler2) {
  return async function(req, res) {
    try {
      if (req.method !== "GET" && req.body === void 0) {
        req.body = {};
      }
      return await handler2(req, res);
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

// netlify/api/settings.js
var settings_default = withErrorHandler(async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const dayStartTime2 = await storage.getDayStartTime();
      return res.status(200).json({
        settings: {
          dayStartTime: dayStartTime2,
          // Add more settings here as needed
          version: "1.0.0",
          defaultCategories: ["Health", "Career", "Finances", "Personal", "Analytics"]
        }
      });
    } catch (error) {
      throw new Error(`Error retrieving settings: ${error.message}`);
    }
  }
  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
});

// netlify/functions/settings/index.js
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
  await settings_default(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var settings_default2 = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/settings"
};
export {
  config,
  settings_default2 as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvc2V0dGluZ3MvaW5kZXguanMiLCAibmV0bGlmeS9hcGkvbmV0bGlmeS1hZGFwdGVyLmpzIiwgIm5ldGxpZnkvYXBpL3BnLW5ldGxpZnktYWRhcHRlci5qcyIsICJuZXRsaWZ5L2FwaS9fc3RvcmFnZS5qcyIsICJuZXRsaWZ5L2FwaS9fZXJyb3ItaGFuZGxlci5qcyIsICJuZXRsaWZ5L2FwaS9zZXR0aW5ncy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciBmb3Igc2V0dGluZ3MgQVBJXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xuLy8gRml4OiBVc2UgYWJzb2x1dGUgcGF0aCByZWZlcmVuY2UgZm9yIHJlbGlhYmxlIGltcG9ydHNcbmltcG9ydCBvcmlnaW5hbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL25ldGxpZnkvYXBpL3NldHRpbmdzLmpzXCI7XG5cbi8vIEV4cHJlc3MgYWRhcHRlciB0byBjb252ZXJ0IFJlcXVlc3QvUmVzcG9uc2Ugb2JqZWN0c1xuY29uc3QgZXhwcmVzc1RvTmV0bGlmeSA9IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgLy8gTW9jayBFeHByZXNzLWxpa2Ugb2JqZWN0c1xuICBjb25zdCBtb2NrUmVxID0ge1xuICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICB1cmw6IHJlcS51cmwsXG4gICAgcGF0aDogbmV3IFVSTChyZXEudXJsKS5wYXRobmFtZSxcbiAgICBxdWVyeTogT2JqZWN0LmZyb21FbnRyaWVzKG5ldyBVUkwocmVxLnVybCkuc2VhcmNoUGFyYW1zKSxcbiAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVxLmhlYWRlcnMpLFxuICAgIGJvZHk6IHJlcS5ib2R5ID8gYXdhaXQgcmVxLmpzb24oKSA6IHVuZGVmaW5lZCxcbiAgICBwYXJhbXM6IGNvbnRleHQucGFyYW1zIHx8IHt9XG4gIH07XG4gIFxuICBsZXQgc3RhdHVzQ29kZSA9IDIwMDtcbiAgbGV0IHJlc3BvbnNlQm9keSA9IHt9O1xuICBsZXQgcmVzcG9uc2VIZWFkZXJzID0ge307XG4gIFxuICAvLyBNb2NrIEV4cHJlc3MgcmVzcG9uc2VcbiAgY29uc3QgbW9ja1JlcyA9IHtcbiAgICBzdGF0dXM6IChjb2RlKSA9PiB7XG4gICAgICBzdGF0dXNDb2RlID0gY29kZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAganNvbjogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXNwb25zZUhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZW5kOiAoYm9keSkgPT4ge1xuICAgICAgcmVzcG9uc2VCb2R5ID0gYm9keTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0SGVhZGVyOiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZXQ6IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGVuZDogKCkgPT4ge31cbiAgfTtcbiAgXG4gIC8vIENhbGwgdGhlIG9yaWdpbmFsIEV4cHJlc3MgaGFuZGxlclxuICBhd2FpdCBvcmlnaW5hbEhhbmRsZXIobW9ja1JlcSwgbW9ja1Jlcyk7XG4gIFxuICAvLyBDb252ZXJ0IHRvIE5ldGxpZnkgUmVzcG9uc2VcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICB0eXBlb2YgcmVzcG9uc2VCb2R5ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlQm9keSkgOiByZXNwb25zZUJvZHksXG4gICAge1xuICAgICAgc3RhdHVzOiBzdGF0dXNDb2RlLFxuICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzXG4gICAgfVxuICApO1xufTtcblxuLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gaGFuZGxlclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xuICByZXR1cm4gZXhwcmVzc1RvTmV0bGlmeShyZXEsIGNvbnRleHQpO1xufTtcblxuLy8gQ29uZmlndXJlIHJvdXRpbmdcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIHBhdGg6IFwiL2FwaS9zZXR0aW5nc1wiXG59O1xuIiwgIi8qKlxuICogTmV0bGlmeSBGdW5jdGlvbnMgU3RvcmFnZSBBZGFwdGVyIChNb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbnMgQ29tcGF0aWJsZSlcbiAqIFxuICogSW4tbWVtb3J5IHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gc3BlY2lmaWNhbGx5IG9wdGltaXplZCBmb3IgTmV0bGlmeSdzIHNlcnZlcmxlc3MgZW52aXJvbm1lbnQuXG4gKiBUaGlzIGFkYXB0ZXIgaXMgZGVzaWduZWQgdG8gd29yayB3aXRoIHRoZSBtb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbnMgQVBJIGFuZCBwcm92aWRlczpcbiAqIFxuICogMS4gUGVyc2lzdGVudCBpbi1tZW1vcnkgc3RvcmFnZSBhY3Jvc3MgZnVuY3Rpb24gaW52b2NhdGlvbnMgKHdpdGhpbiB0aGUgc2FtZSBmdW5jdGlvbiBpbnN0YW5jZSlcbiAqIDIuIENvbXBhdGliaWxpdHkgd2l0aCBOZXRsaWZ5J3MgcmVhZC1vbmx5IGZpbGVzeXN0ZW1cbiAqIDMuIEF1dG9tYXRpYyBpbml0aWFsaXphdGlvbiB3aXRoIGRlZmF1bHQgZGF0YVxuICogNC4gQ29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIHN0b3JhZ2UgaW50ZXJmYWNlXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW4tbWVtb3J5IHN0b3JhZ2UgbWFwc1xuY29uc3QgdGFza3NNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCBoYWJpdHNNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCBub3Rlc01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IHVzZXJNYXAgPSBuZXcgTWFwKCk7XG5cbi8vIENvdW50ZXIgZm9yIGdlbmVyYXRpbmcgSURzXG5sZXQgdGFza0N1cnJlbnRJZCA9IDE7XG5sZXQgaGFiaXRDdXJyZW50SWQgPSAxO1xubGV0IG5vdGVDdXJyZW50SWQgPSAxO1xubGV0IHVzZXJDdXJyZW50SWQgPSAxO1xuXG4vLyBEYXkgc3RhcnQgdGltZSBzZXR0aW5nXG5jb25zdCBERUZBVUxUX0RBWV9TVEFSVF9USU1FID0gJzA0OjAwJzsgLy8gNCBBTSBkZWZhdWx0XG5sZXQgZGF5U3RhcnRUaW1lID0gREVGQVVMVF9EQVlfU1RBUlRfVElNRTtcblxuLy8gRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmVybGVzc1N0b3JhZ2UgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGRhdGFcbiAgaWYgKHRhc2tzTWFwLnNpemUgPT09IDAgJiYgaGFiaXRzTWFwLnNpemUgPT09IDAgJiYgbm90ZXNNYXAuc2l6ZSA9PT0gMCkge1xuICAgIGluaXRpYWxpemVEZWZhdWx0RGF0YSgpO1xuICB9XG4gIFxuICByZXR1cm4ge1xuICAgIC8vIFVzZXIgbWV0aG9kc1xuICAgIGFzeW5jIGdldFVzZXIoaWQpIHtcbiAgICAgIHJldHVybiB1c2VyTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gICAgICAvLyBGaW5kIHRoZSB1c2VyIHdpdGggdGhlIGdpdmVuIHVzZXJuYW1lXG4gICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgdXNlck1hcC52YWx1ZXMoKSkge1xuICAgICAgICBpZiAodXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpID09PSB1c2VybmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVXNlcih1c2VyRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSB1c2VyQ3VycmVudElkKys7XG4gICAgICBjb25zdCB1c2VyID0geyBcbiAgICAgICAgLi4udXNlckRhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgdXNlck1hcC5zZXQoaWQsIHVzZXIpO1xuICAgICAgcmV0dXJuIHVzZXI7XG4gICAgfSxcbiAgICBcbiAgICAvLyBUYXNrIG1ldGhvZHNcbiAgICBhc3luYyBnZXRUYXNrcygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRhc2tzTWFwLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIENvbXBsZXRlZCB0YXNrcyBzaG91bGQgYXBwZWFyIGFmdGVyIG5vbi1jb21wbGV0ZWQgdGFza3NcbiAgICAgICAgaWYgKGEuY29tcGxldGVkICE9PSBiLmNvbXBsZXRlZCkge1xuICAgICAgICAgIHJldHVybiBhLmNvbXBsZXRlZCA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTb3J0IGJ5IGNyZWF0aW9uIGRhdGUgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIuY3JlYXRlZEF0KSAtIG5ldyBEYXRlKGEuY3JlYXRlZEF0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VGFzayhpZCkge1xuICAgICAgcmV0dXJuIHRhc2tzTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVRhc2sodGFza0RhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gdGFza0N1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgdGFzayA9IHsgXG4gICAgICAgIC4uLnRhc2tEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHRhc2tzTWFwLnNldChpZCwgdGFzayk7XG4gICAgICByZXR1cm4gdGFzaztcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZVRhc2soaWQsIHRhc2tEYXRhKSB7XG4gICAgICBjb25zdCB0YXNrID0gdGFza3NNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghdGFzaykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRUYXNrID0geyBcbiAgICAgICAgLi4udGFzaywgXG4gICAgICAgIC4uLnRhc2tEYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgdGFza3NNYXAuc2V0KGlkLCB1cGRhdGVkVGFzayk7XG4gICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVUYXNrKGlkKSB7XG4gICAgICBjb25zdCB0YXNrID0gdGFza3NNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghdGFzaykgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICB0YXNrc01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBIYWJpdCBtZXRob2RzXG4gICAgYXN5bmMgZ2V0SGFiaXRzKCkge1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGNvbnN0IGhhYml0c0FycmF5ID0gQXJyYXkuZnJvbShoYWJpdHNNYXAudmFsdWVzKCkpO1xuICAgICAgXG4gICAgICAvLyBBZGQgaXNBY3RpdmVUb2RheSBmaWVsZCB0byBlYWNoIGhhYml0XG4gICAgICByZXR1cm4gaGFiaXRzQXJyYXkubWFwKGhhYml0ID0+ICh7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9KSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZUhhYml0KGhhYml0RGF0YSkge1xuICAgICAgY29uc3QgaWQgPSBoYWJpdEN1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgaGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdERhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsIC8vICdwZW5kaW5nJywgJ2NvbXBsZXRlZCcsICdmYWlsZWQnXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgaGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVIYWJpdChpZCwgaGFiaXREYXRhKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgLi4uaGFiaXREYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjb21wbGV0ZUhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmFpbEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAnZmFpbGVkJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgcmVzZXRIYWJpdFN0YXR1cyhpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBpbmNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdHlwZW9mIGhhYml0LmN1cnJlbnRWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5jdXJyZW50VmFsdWUgOiAwO1xuICAgICAgY29uc3QgbWF4VmFsdWUgPSB0eXBlb2YgaGFiaXQubWF4VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQubWF4VmFsdWUgOiBJbmZpbml0eTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5taW4oY3VycmVudFZhbHVlICsgMSwgbWF4VmFsdWUpO1xuICAgICAgXG4gICAgICBjb25zdCBzdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVjcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHR5cGVvZiBoYWJpdC5jdXJyZW50VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQuY3VycmVudFZhbHVlIDogMDtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5tYXgoY3VycmVudFZhbHVlIC0gMSwgMCk7XG4gICAgICBcbiAgICAgIGNvbnN0IG1heFZhbHVlID0gdHlwZW9mIGhhYml0Lm1heFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0Lm1heFZhbHVlIDogSW5maW5pdHk7XG4gICAgICBjb25zdCBzdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBOb3RlIG1ldGhvZHNcbiAgICBhc3luYyBnZXROb3RlcygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKG5vdGVzTWFwLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIFNvcnQgYnkgY3JlYXRpb24gZGF0ZSAobmV3ZXN0IGZpcnN0KVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoYi5jcmVhdGVkQXQpIC0gbmV3IERhdGUoYS5jcmVhdGVkQXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgICAgLy8gRmluZCB0aGUgbm90ZSB3aXRoIHRoZSBnaXZlbiBjYXRlZ29yeSAoY2FzZS1pbnNlbnNpdGl2ZSlcbiAgICAgIGZvciAoY29uc3Qgbm90ZSBvZiBub3Rlc01hcC52YWx1ZXMoKSkge1xuICAgICAgICBpZiAobm90ZS5jYXRlZ29yeS50b0xvd2VyQ2FzZSgpID09PSBjYXRlZ29yeS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIG5vdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlTm90ZShub3RlRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSBub3RlQ3VycmVudElkKys7XG4gICAgICBjb25zdCBub3RlID0geyBcbiAgICAgICAgLi4ubm90ZURhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBub3Rlc01hcC5zZXQoaWQsIG5vdGUpO1xuICAgICAgcmV0dXJuIG5vdGU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVOb3RlKGlkLCBub3RlRGF0YSkge1xuICAgICAgY29uc3Qgbm90ZSA9IG5vdGVzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIW5vdGUpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkTm90ZSA9IHsgXG4gICAgICAgIC4uLm5vdGUsIFxuICAgICAgICAuLi5ub3RlRGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLnNldChpZCwgdXBkYXRlZE5vdGUpO1xuICAgICAgcmV0dXJuIHVwZGF0ZWROb3RlO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5SWQoaWQpIHtcbiAgICAgIHJldHVybiBub3Rlc01hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVOb3RlKGlkKSB7XG4gICAgICBjb25zdCBub3RlID0gbm90ZXNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghbm90ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBub3Rlc01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBTZXR0aW5nc1xuICAgIGFzeW5jIGdldERheVN0YXJ0VGltZSgpIHtcbiAgICAgIHJldHVybiBkYXlTdGFydFRpbWUgfHwgREVGQVVMVF9EQVlfU1RBUlRfVElNRTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHNldERheVN0YXJ0VGltZSh0aW1lKSB7XG4gICAgICBkYXlTdGFydFRpbWUgPSB0aW1lO1xuICAgICAgcmV0dXJuIGRheVN0YXJ0VGltZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIERhaWx5IGRhdGEgbG9nZ2luZ1xuICAgIGFzeW5jIGxvZ0RhaWx5RGF0YShkYXRlU3RyLCByZXNldEhhYml0cyA9IHRydWUpIHtcbiAgICAgIGlmIChyZXNldEhhYml0cykge1xuICAgICAgICAvLyBSZXNldCBhbGwgYm9vbGVhbiBoYWJpdHMgdG8gcGVuZGluZ1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgaGFiaXRdIG9mIGhhYml0c01hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAoaGFiaXQudHlwZSA9PT0gJ2Jvb2xlYW4nICYmIGhhYml0LnN0YXR1cyAhPT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgICBoYWJpdHNNYXAuc2V0KGlkLCB7XG4gICAgICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZXNldCBhbGwgY291bnRlciBoYWJpdHMgdG8gMFxuICAgICAgICAgIGlmIChoYWJpdC50eXBlID09PSAnY291bnRlcicpIHtcbiAgICAgICAgICAgIGhhYml0c01hcC5zZXQoaWQsIHtcbiAgICAgICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTogMCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIGhhYml0IGlzIGFjdGl2ZSBvbiBhIGdpdmVuIGRheVxuZnVuY3Rpb24gaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KSB7XG4gIGlmICghaGFiaXQucmVwZWF0VHlwZSkgcmV0dXJuIHRydWU7XG4gIFxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGRheU9mV2VlayA9IHRvZGF5LmdldERheSgpOyAvLyAwID0gU3VuZGF5LCAxID0gTW9uZGF5LCBldGMuXG4gIFxuICBpZiAoaGFiaXQucmVwZWF0VHlwZSA9PT0gJ2RhaWx5Jykge1xuICAgIC8vIEZvciBkYWlseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgZXZlcnkgZGF5IG9yIG9ubHkgb24gc3BlY2lmaWMgZGF5c1xuICAgIGlmIChoYWJpdC5yZXBlYXREYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiBoYWJpdC5yZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgaWYgKGhhYml0LnJlcGVhdFR5cGUgPT09ICd3ZWVrbHknKSB7XG4gICAgLy8gRm9yIHdlZWtseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgb24gdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICBpZiAoaGFiaXQucmVwZWF0RGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gaGFiaXQucmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBJbml0aWFsaXplIHdpdGggc29tZSBleGFtcGxlIGRhdGFcbmZ1bmN0aW9uIGluaXRpYWxpemVEZWZhdWx0RGF0YSgpIHtcbiAgLy8gQ3JlYXRlIHNvbWUgZGVmYXVsdCBoYWJpdHNcbiAgY29uc3QgaGFiaXQxID0ge1xuICAgIGlkOiBoYWJpdEN1cnJlbnRJZCsrLFxuICAgIG5hbWU6ICdNb3JuaW5nIEV4ZXJjaXNlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgcmVwZWF0VHlwZTogJ2RhaWx5JyxcbiAgICByZXBlYXREYXlzOiAnKicsXG4gICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IGhhYml0MiA9IHtcbiAgICBpZDogaGFiaXRDdXJyZW50SWQrKyxcbiAgICBuYW1lOiAnRHJpbmsgd2F0ZXInLFxuICAgIHR5cGU6ICdjb3VudGVyJyxcbiAgICBtYXhWYWx1ZTogOCxcbiAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgcmVwZWF0VHlwZTogJ2RhaWx5JyxcbiAgICByZXBlYXREYXlzOiAnKicsXG4gICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGhhYml0c01hcC5zZXQoaGFiaXQxLmlkLCBoYWJpdDEpO1xuICBoYWJpdHNNYXAuc2V0KGhhYml0Mi5pZCwgaGFiaXQyKTtcbiAgXG4gIC8vIENyZWF0ZSBkZWZhdWx0IHRhc2tcbiAgY29uc3QgdGFzayA9IHtcbiAgICBpZDogdGFza0N1cnJlbnRJZCsrLFxuICAgIHRleHQ6ICdDcmVhdGUgcHJvamVjdCBwbGFuJyxcbiAgICBjb21wbGV0ZWQ6IGZhbHNlLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICB0YXNrc01hcC5zZXQodGFzay5pZCwgdGFzayk7XG4gIFxuICAvLyBDcmVhdGUgZGVmYXVsdCBub3Rlc1xuICBjb25zdCBub3RlMSA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnSGVhbHRoJyxcbiAgICBjb250ZW50OiAnIyBIZWFsdGggR29hbHNcXG5cXG4tIEltcHJvdmUgc2xlZXAgc2NoZWR1bGVcXG4tIERyaW5rIG1vcmUgd2F0ZXJcXG4tIEV4ZXJjaXNlIDMgdGltZXMgYSB3ZWVrJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTIgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0NhcmVlcicsXG4gICAgY29udGVudDogJyMgQ2FyZWVyIE5vdGVzXFxuXFxuLSBVcGRhdGUgcmVzdW1lXFxuLSBOZXR3b3JrIHdpdGggaW5kdXN0cnkgcHJvZmVzc2lvbmFsc1xcbi0gTGVhcm4gbmV3IHNraWxscycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGUzID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdGaW5hbmNlcycsXG4gICAgY29udGVudDogJyMgRmluYW5jaWFsIEdvYWxzXFxuXFxuLSBTYXZlIDIwJSBvZiBpbmNvbWVcXG4tIFJldmlldyBidWRnZXQgbW9udGhseVxcbi0gUmVzZWFyY2ggaW52ZXN0bWVudCBvcHRpb25zJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTQgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ1BlcnNvbmFsJyxcbiAgICBjb250ZW50OiAnIyBQZXJzb25hbCBEZXZlbG9wbWVudFxcblxcbi0gUmVhZCBvbmUgYm9vayBwZXIgbW9udGhcXG4tIFByYWN0aWNlIG1lZGl0YXRpb25cXG4tIFNwZW5kIHF1YWxpdHkgdGltZSB3aXRoIGZhbWlseScsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIG5vdGVzTWFwLnNldChub3RlMS5pZCwgbm90ZTEpO1xuICBub3Rlc01hcC5zZXQobm90ZTIuaWQsIG5vdGUyKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGUzLmlkLCBub3RlMyk7XG4gIG5vdGVzTWFwLnNldChub3RlNC5pZCwgbm90ZTQpO1xufVxuXG4vLyBFeHBvcnQgdGhlIG5ldGxpZnkgc3RvcmFnZSBzaW5nbGV0b25cbmV4cG9ydCBjb25zdCBuZXRsaWZ5U3RvcmFnZSA9IGNyZWF0ZVNlcnZlcmxlc3NTdG9yYWdlKCk7IiwgIi8qKlxuICogUG9zdGdyZVNRTCBBZGFwdGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9uc1xuICogXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBhIFBvc3RncmVTUUwtYmFzZWQgaW1wbGVtZW50YXRpb24gb2YgdGhlIHN0b3JhZ2UgaW50ZXJmYWNlXG4gKiBmb3IgTmV0bGlmeSBGdW5jdGlvbnMuIEl0IGNvbm5lY3RzIGRpcmVjdGx5IHRvIHRoZSBQb3N0Z3JlU1FMIGRhdGFiYXNlIHVzaW5nXG4gKiB0aGUgREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEltcG9ydCB0aGUgcGcgbW9kdWxlXG5pbXBvcnQgcGtnIGZyb20gJ3BnJztcbmNvbnN0IHsgUG9vbCB9ID0gcGtnO1xuXG4vLyBDcmVhdGUgYSBjb25uZWN0aW9uIHBvb2xcbmxldCBwb29sO1xuXG4vLyBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFBvc3RncmVTUUwtYmFzZWQgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGNyZWF0ZVBnU3RvcmFnZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGl6ZSBwb29sIGlmIG5vdCBhbHJlYWR5IGNyZWF0ZWRcbiAgaWYgKCFwb29sKSB7XG4gICAgY29uc3QgZGF0YWJhc2VVcmwgPSBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkw7XG4gICAgXG4gICAgaWYgKCFkYXRhYmFzZVVybCkge1xuICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IERBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBtaXNzaW5nJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBJbml0aWFsaXppbmcgUG9zdGdyZVNRTCBjb25uZWN0aW9uIChVUkwgbGVuZ3RoOiAke2RhdGFiYXNlVXJsLmxlbmd0aH0pYCk7XG4gICAgXG4gICAgcG9vbCA9IG5ldyBQb29sKHtcbiAgICAgIGNvbm5lY3Rpb25TdHJpbmc6IGRhdGFiYXNlVXJsLFxuICAgICAgLy8gRW5hYmxlIFNTTCB3aXRoIHJlamVjdFVuYXV0aG9yaXplZCBzZXQgdG8gZmFsc2UgZm9yIE5ldGxpZnlcbiAgICAgIHNzbDoge1xuICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUZXN0IHRoZSBjb25uZWN0aW9uXG4gICAgcG9vbC5xdWVyeSgnU0VMRUNUIE5PVygpJylcbiAgICAgIC50aGVuKCgpID0+IGNvbnNvbGUubG9nKCdQb3N0Z3JlU1FMIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bCcpKVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Bvc3RncmVTUUwgY29ubmVjdGlvbiBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N0YWNrIHRyYWNlOicsIGVyci5zdGFjayk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLy8gVXNlciBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VXNlcihpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VXNlcjonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgdXNlcm5hbWUgPSAkMScsXG4gICAgICAgICAgW3VzZXJuYW1lXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFVzZXJCeVVzZXJuYW1lOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVVc2VyKHVzZXJEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyB1c2VycyAodXNlcm5hbWUsIHBhc3N3b3JkKSBWQUxVRVMgKCQxLCAkMikgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFt1c2VyRGF0YS51c2VybmFtZSwgdXNlckRhdGEucGFzc3dvcmRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZVVzZXI6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIFRhc2sgbWV0aG9kc1xuICAgIGFzeW5jIGdldFRhc2tzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSB0YXNrcyBPUkRFUiBCWSBjb21wbGV0ZWQgQVNDLCBjcmVhdGVkX2F0IERFU0MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VGFza3M6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFRhc2soaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdGFza3MgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVRhc2sodGFza0RhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyB0YXNrIHdpdGggZGF0YTonLCBKU09OLnN0cmluZ2lmeSh0YXNrRGF0YSkpO1xuICAgICAgICBcbiAgICAgICAgLy8gRXh0cmFjdCB0YXNrIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0c1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGFza0RhdGEudGV4dDtcbiAgICAgICAgY29uc3QgY29tcGxldGVkID0gdGFza0RhdGEuY29tcGxldGVkIHx8IGZhbHNlO1xuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSB0YXNrRGF0YS5jcmVhdGVkQXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zdCB1c2VySWQgPSB0YXNrRGF0YS51c2VySWQgfHwgbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIHRhc2tzICh0ZXh0LCBjb21wbGV0ZWQsIGNyZWF0ZWRfYXQsIHVzZXJfaWQpIFZBTFVFUyAoJDEsICQyLCAkMywgJDQpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbdGV4dCwgY29tcGxldGVkLCBjcmVhdGVkQXQsIHVzZXJJZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRldGFpbHM6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N0YWNrIHRyYWNlOicsIGVycm9yLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVUYXNrKGlkLCB0YXNrRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmICgndGV4dCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHRleHQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY29tcGxldGVkJyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY29tcGxldGVkID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLmNvbXBsZXRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY3JlYXRlZEF0JyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY3JlYXRlZF9hdCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS5jcmVhdGVkQXQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ3VzZXJJZCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHVzZXJfaWQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEudXNlcklkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSB0YXNrc1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlVGFzayhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gdGFza3MgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIEhhYml0IG1ldGhvZHNcbiAgICBhc3luYyBnZXRIYWJpdHMoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIGhhYml0cycpO1xuICAgICAgICBjb25zdCBoYWJpdHMgPSByZXN1bHQucm93cztcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBpc0FjdGl2ZVRvZGF5IGZpZWxkIHRvIGVhY2ggaGFiaXRcbiAgICAgICAgcmV0dXJuIGhhYml0cy5tYXAoaGFiaXQgPT4gKHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH0pKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldEhhYml0czonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlSGFiaXQoaGFiaXREYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDb252ZXJ0IGFycmF5IHRvIHN0cmluZyBmb3IgZGF0YWJhc2Ugc3RvcmFnZSBpZiBuZWVkZWRcbiAgICAgICAgbGV0IHJlcGVhdERheXMgPSBoYWJpdERhdGEucmVwZWF0RGF5cztcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVwZWF0RGF5cykpIHtcbiAgICAgICAgICByZXBlYXREYXlzID0gcmVwZWF0RGF5cy5qb2luKCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgYElOU0VSVCBJTlRPIGhhYml0cyAoXG4gICAgICAgICAgICBuYW1lLCB0eXBlLCB2YWx1ZSwgbWF4X3ZhbHVlLCBzdGF0dXMsIHJlcGVhdF90eXBlLCByZXBlYXRfZGF5cywgdXNlcl9pZCwgbGFzdF9yZXNldFxuICAgICAgICAgICkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5KSBSRVRVUk5JTkcgKmAsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgaGFiaXREYXRhLm5hbWUsXG4gICAgICAgICAgICBoYWJpdERhdGEudHlwZSB8fCAnYm9vbGVhbicsXG4gICAgICAgICAgICBoYWJpdERhdGEudmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5tYXhWYWx1ZSB8fCAwLFxuICAgICAgICAgICAgaGFiaXREYXRhLnN0YXR1cyB8fCAncGVuZGluZycsXG4gICAgICAgICAgICBoYWJpdERhdGEucmVwZWF0VHlwZSB8fCAnZGFpbHknLFxuICAgICAgICAgICAgcmVwZWF0RGF5cyB8fCAnKicsXG4gICAgICAgICAgICBoYWJpdERhdGEudXNlcklkIHx8IG51bGwsXG4gICAgICAgICAgICBoYWJpdERhdGEubGFzdFJlc2V0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZUhhYml0KGlkLCBoYWJpdERhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgcmVwZWF0RGF5cyBzcGVjaWFsbHkgLSBjb252ZXJ0IGFycmF5IHRvIHN0cmluZ1xuICAgICAgICBpZiAoJ3JlcGVhdERheXMnIGluIGhhYml0RGF0YSkge1xuICAgICAgICAgIGxldCByZXBlYXREYXlzID0gaGFiaXREYXRhLnJlcGVhdERheXM7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVwZWF0RGF5cykpIHtcbiAgICAgICAgICAgIHJlcGVhdERheXMgPSByZXBlYXREYXlzLmpvaW4oJywnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGByZXBlYXRfZGF5cyA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChyZXBlYXREYXlzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZmllbGRzID0ge1xuICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICB0eXBlOiAndHlwZScsXG4gICAgICAgICAgdmFsdWU6ICd2YWx1ZScsXG4gICAgICAgICAgbWF4VmFsdWU6ICdtYXhfdmFsdWUnLFxuICAgICAgICAgIHN0YXR1czogJ3N0YXR1cycsXG4gICAgICAgICAgcmVwZWF0VHlwZTogJ3JlcGVhdF90eXBlJyxcbiAgICAgICAgICB1c2VySWQ6ICd1c2VyX2lkJyxcbiAgICAgICAgICBsYXN0UmVzZXQ6ICdsYXN0X3Jlc2V0J1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIGFsbCB0aGUgb3RoZXIgZmllbGRzXG4gICAgICAgIGZvciAoY29uc3QgW2pzRmllbGQsIGRiRmllbGRdIG9mIE9iamVjdC5lbnRyaWVzKGZpZWxkcykpIHtcbiAgICAgICAgICBpZiAoanNGaWVsZCBpbiBoYWJpdERhdGEpIHtcbiAgICAgICAgICAgIHVwZGF0ZXMucHVzaChgJHtkYkZpZWxkfSA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKGhhYml0RGF0YVtqc0ZpZWxkXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIGhhYml0c1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIFxuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNvbXBsZXRlSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsnY29tcGxldGVkJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY29tcGxldGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmFpbEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ2ZhaWxlZCcsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGZhaWxIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgcmVzZXRIYWJpdFN0YXR1cyhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydwZW5kaW5nJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gcmVzZXRIYWJpdFN0YXR1czonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgaW5jcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEZpcnN0IGdldCB0aGUgY3VycmVudCBoYWJpdCB0byBjaGVjayB0aGUgdHlwZSBhbmQgZ2V0IHRoZSBjdXJyZW50IHZhbHVlXG4gICAgICAgIGNvbnN0IGhhYml0UmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdFJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBoYWJpdC52YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IGhhYml0Lm1heF92YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWluKGN1cnJlbnRWYWx1ZSArIDEsIG1heFZhbHVlKTtcbiAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gJDEsIHN0YXR1cyA9ICQyIFdIRVJFIGlkID0gJDMgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtuZXdWYWx1ZSwgbmV3U3RhdHVzLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIXVwZGF0ZWRIYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gaW5jcmVtZW50SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBGaXJzdCBnZXQgdGhlIGN1cnJlbnQgaGFiaXQgdG8gY2hlY2sgdGhlIHR5cGUgYW5kIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgICAgICBjb25zdCBoYWJpdFJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRSZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gaGFiaXQudmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWF4VmFsdWUgPSBoYWJpdC5tYXhfdmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1heChjdXJyZW50VmFsdWUgLSAxLCAwKTtcbiAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gJDEsIHN0YXR1cyA9ICQyIFdIRVJFIGlkID0gJDMgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtuZXdWYWx1ZSwgbmV3U3RhdHVzLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIXVwZGF0ZWRIYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVjcmVtZW50SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZUhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBOb3RlIG1ldGhvZHNcbiAgICBhc3luYyBnZXROb3RlcygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gbm90ZXMgT1JERVIgQlkgY3JlYXRlZF9hdCBERVNDJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93cztcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldE5vdGVzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coYEZldGNoaW5nIG5vdGUgZm9yIGNhdGVnb3J5OiAke2NhdGVnb3J5fWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIG5vdGVzIFdIRVJFIExPV0VSKGNhdGVnb3J5KSA9IExPV0VSKCQxKScsXG4gICAgICAgICAgW2NhdGVnb3J5XVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGdldE5vdGVCeUNhdGVnb3J5IGZvciAke2NhdGVnb3J5fTpgLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5SWQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gbm90ZXMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldE5vdGVCeUlkOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVOb3RlKG5vdGVEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDaGVjayBpZiBub3RlIHdpdGggdGhpcyBjYXRlZ29yeSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBjb25zdCBleGlzdGluZ05vdGUgPSBhd2FpdCB0aGlzLmdldE5vdGVCeUNhdGVnb3J5KG5vdGVEYXRhLmNhdGVnb3J5KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChleGlzdGluZ05vdGUpIHtcbiAgICAgICAgICAvLyBVcGRhdGUgZXhpc3Rpbmcgbm90ZVxuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZU5vdGUoZXhpc3RpbmdOb3RlLmlkLCB7XG4gICAgICAgICAgICBjb250ZW50OiBub3RlRGF0YS5jb250ZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBuZXcgbm90ZSBpZiBub25lIGV4aXN0c1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyBub3RlcyAoY2F0ZWdvcnksIGNvbnRlbnQsIGNyZWF0ZWRfYXQpIFZBTFVFUyAoJDEsICQyLCAkMykgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG5vdGVEYXRhLmNhdGVnb3J5LFxuICAgICAgICAgICAgbm90ZURhdGEuY29udGVudCxcbiAgICAgICAgICAgIG5vdGVEYXRhLmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICBdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZU5vdGUoaWQsIG5vdGVEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCdjYXRlZ29yeScgaW4gbm90ZURhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNhdGVnb3J5ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG5vdGVEYXRhLmNhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjb250ZW50JyBpbiBub3RlRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY29udGVudCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChub3RlRGF0YS5jb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSBub3Rlc1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlTm90ZShpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gbm90ZXMgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIERhaWx5IGRhdGEgbG9nZ2luZ1xuICAgIGFzeW5jIGxvZ0RhaWx5RGF0YShkYXRlU3RyLCByZXNldEhhYml0cyA9IHRydWUpIHtcbiAgICAgIGlmIChyZXNldEhhYml0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFJlc2V0IGFsbCBib29sZWFuIGhhYml0cyB0byBwZW5kaW5nXG4gICAgICAgICAgYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAgIFwiVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJ3BlbmRpbmcnIFdIRVJFIHR5cGUgPSAnYm9vbGVhbidcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGNvdW50ZXIgaGFiaXRzIHRvIDBcbiAgICAgICAgICBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICAgXCJVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9IDAsIHN0YXR1cyA9ICdwZW5kaW5nJyBXSEVSRSB0eXBlID0gJ2NvdW50ZXInXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGxvZ0RhaWx5RGF0YTonLCBlcnJvcik7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gU2V0dGluZ3NcbiAgICBhc3luYyBnZXREYXlTdGFydFRpbWUoKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBHZXQgdGhlIHNldHRpbmcgZnJvbSBhIHNldHRpbmdzIHRhYmxlIG9yIHJldHVybiBkZWZhdWx0XG4gICAgICAgIHJldHVybiAnMDQ6MDAnOyAvLyBEZWZhdWx0IHRvIDQgQU1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldERheVN0YXJ0VGltZTonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiAnMDQ6MDAnOyAvLyBEZWZhdWx0IHZhbHVlXG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBzZXREYXlTdGFydFRpbWUodGltZSkge1xuICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCBzYXZlIHRvIGRhdGFiYXNlXG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgaGFiaXQgaXMgYWN0aXZlIHRvZGF5XG5mdW5jdGlvbiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpIHtcbiAgaWYgKCFoYWJpdC5yZXBlYXRfdHlwZSkgcmV0dXJuIHRydWU7XG4gIFxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGRheU9mV2VlayA9IHRvZGF5LmdldERheSgpOyAvLyAwID0gU3VuZGF5LCAxID0gTW9uZGF5LCBldGMuXG4gIFxuICBpZiAoaGFiaXQucmVwZWF0X3R5cGUgPT09ICdkYWlseScpIHtcbiAgICAvLyBGb3IgZGFpbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IGV2ZXJ5IGRheSBvciBvbmx5IG9uIHNwZWNpZmljIGRheXNcbiAgICBpZiAoaGFiaXQucmVwZWF0X2RheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ29udmVydCByZXBlYXRfZGF5cyB0byBhcnJheSBpZiBpdCdzIGEgc3RyaW5nXG4gICAgY29uc3QgcmVwZWF0RGF5cyA9IHR5cGVvZiBoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJ3N0cmluZycgXG4gICAgICA/IGhhYml0LnJlcGVhdF9kYXlzLnNwbGl0KCcsJykgXG4gICAgICA6IGhhYml0LnJlcGVhdF9kYXlzO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiByZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgaWYgKGhhYml0LnJlcGVhdF90eXBlID09PSAnd2Vla2x5Jykge1xuICAgIC8vIEZvciB3ZWVrbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IG9uIHRoaXMgZGF5IG9mIHRoZSB3ZWVrXG4gICAgaWYgKGhhYml0LnJlcGVhdF9kYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENvbnZlcnQgcmVwZWF0X2RheXMgdG8gYXJyYXkgaWYgaXQncyBhIHN0cmluZ1xuICAgIGNvbnN0IHJlcGVhdERheXMgPSB0eXBlb2YgaGFiaXQucmVwZWF0X2RheXMgPT09ICdzdHJpbmcnIFxuICAgICAgPyBoYWJpdC5yZXBlYXRfZGF5cy5zcGxpdCgnLCcpIFxuICAgICAgOiBoYWJpdC5yZXBlYXRfZGF5cztcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gcmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IHBnU3RvcmFnZSA9IGNyZWF0ZVBnU3RvcmFnZSgpOyIsICIvKipcbiAqIFN0b3JhZ2UgaW50ZXJmYWNlIGZvciBBUEkgaGFuZGxlcnNcbiAqIFRoaXMgZmlsZSBzZXJ2ZXMgYXMgdGhlIGNlbnRyYWwgZGF0YSBhY2Nlc3MgbGF5ZXIgZm9yIHRoZSBBUElcbiAqIFxuICogVGhpcyBmaWxlIHVzZXMgdGhlIFBvc3RncmVTUUwgc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiBmb3IgcHJvZHVjdGlvbiBlbnZpcm9ubWVudHNcbiAqIGFuZCBmYWxscyBiYWNrIHRvIGluLW1lbW9yeSBzdG9yYWdlIGZvciBkZXZlbG9wbWVudCBpZiBEQVRBQkFTRV9VUkwgaXMgbm90IHNldC5cbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbXBvcnQgYm90aCBzdG9yYWdlIGltcGxlbWVudGF0aW9uc1xuaW1wb3J0IHsgbmV0bGlmeVN0b3JhZ2UgfSBmcm9tICcuL25ldGxpZnktYWRhcHRlcic7XG5pbXBvcnQgeyBwZ1N0b3JhZ2UgfSBmcm9tICcuL3BnLW5ldGxpZnktYWRhcHRlcic7XG5cbi8vIERlY2lkZSB3aGljaCBzdG9yYWdlIGltcGxlbWVudGF0aW9uIHRvIHVzZSBiYXNlZCBvbiBlbnZpcm9ubWVudFxubGV0IHNlbGVjdGVkU3RvcmFnZTtcblxuLy8gUHJvZHVjdGlvbiBtb2RlIHdpdGggREFUQUJBU0VfVVJMIC0gdXNlIFBvc3RncmVzXG5pZiAocHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gIGNvbnNvbGUubG9nKCdVc2luZyBQb3N0Z3JlU1FMIHN0b3JhZ2UgZm9yIE5ldGxpZnkgRnVuY3Rpb25zJyk7XG4gIHNlbGVjdGVkU3RvcmFnZSA9IHBnU3RvcmFnZTtcbn0gXG4vLyBGYWxsYmFjayB0byBpbi1tZW1vcnkgc3RvcmFnZVxuZWxzZSB7XG4gIGNvbnNvbGUubG9nKCdEQVRBQkFTRV9VUkwgbm90IGZvdW5kLCB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSAobm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uKScpO1xuICBzZWxlY3RlZFN0b3JhZ2UgPSBuZXRsaWZ5U3RvcmFnZTtcbn1cblxuLyoqXG4gKiBUaGUgdW5pZmllZCBzdG9yYWdlIGludGVyZmFjZSB0aGF0J3MgdXNlZCBhY3Jvc3MgYWxsIEFQSSBoYW5kbGVyc1xuICogVGhpcyBhYnN0cmFjdHMgYXdheSB0aGUgaW1wbGVtZW50YXRpb24gZGV0YWlscyBhbmQgcHJvdmlkZXMgYSBjb25zaXN0ZW50IGludGVyZmFjZVxuICovXG5leHBvcnQgY29uc3Qgc3RvcmFnZSA9IHNlbGVjdGVkU3RvcmFnZTsiLCAiLyoqXG4gKiBFcnJvciBIYW5kbGluZyBVdGlsaXRpZXMgZm9yIE5ldGxpZnkgRnVuY3Rpb25zXG4gKiBcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHV0aWxpdHkgZnVuY3Rpb25zIGZvciBzdGFuZGFyZGl6ZWQgZXJyb3IgaGFuZGxpbmdcbiAqIGFjcm9zcyBhbGwgQVBJIGVuZHBvaW50cywgbWFraW5nIGl0IGVhc2llciB0byBtYWludGFpbiBjb25zaXN0ZW50IGVycm9yIHJlc3BvbnNlcy5cbiAqIFRoZXNlIHV0aWxpdGllcyBhcmUgY29tcGF0aWJsZSB3aXRoIGJvdGggRXhwcmVzcy1zdHlsZSBoYW5kbGVycyBhbmQgbW9kZXJuIE5ldGxpZnkgRnVuY3Rpb25zLlxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKiBcbiAqIFRoaXMgYWxzbyBzZXJ2ZXMgYXMgYSBkZWJ1Z2dpbmcgZW5kcG9pbnQgZm9yIHRoZSBlcnJvci1oYW5kbGVyIG1vZHVsZVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGNvbnNvbGUubG9nKCdFcnJvciBoYW5kbGVyIG1vZHVsZSBhY2Nlc3NlZCBkaXJlY3RseScpO1xuICBjb25zb2xlLmxvZygnREFUQUJBU0VfVVJMIGF2YWlsYWJsZTonLCBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwgPyAnWWVzIChsZW5ndGg6ICcgKyBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwubGVuZ3RoICsgJyknIDogJ05vJyk7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhFcnJvckhhbmRsZXIoaGFuZGxlcikge1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFNldCBKU09OIHBhcnNpbmcgZm9yIGFsbCByZXF1ZXN0c1xuICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnICYmIHJlcS5ib2R5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVxLmJvZHkgPSB7fTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ2FsbCB0aGUgb3JpZ2luYWwgaGFuZGxlclxuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIocmVxLCByZXMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBBUEkgRXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIFxuICAgICAgLy8gRGV0ZXJtaW5lIHN0YXR1cyBjb2RlIGJhc2VkIG9uIGVycm9yIG1lc3NhZ2VcbiAgICAgIGxldCBzdGF0dXNDb2RlID0gNTAwO1xuICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ25vdCBmb3VuZCcpKSBzdGF0dXNDb2RlID0gNDA0O1xuICAgICAgZWxzZSBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygncmVxdWlyZWQnKSB8fCBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdJbnZhbGlkJykpIHN0YXR1c0NvZGUgPSA0MDA7XG4gICAgICBlbHNlIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCd1bmF1dGhvcml6ZWQnKSB8fCBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdmb3JiaWRkZW4nKSkgc3RhdHVzQ29kZSA9IDQwMztcbiAgICAgIFxuICAgICAgLy8gUmV0dXJuIGEgc3RhbmRhcmRpemVkIGVycm9yIHJlc3BvbnNlXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyhzdGF0dXNDb2RlKS5qc29uKHtcbiAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgcmVxdWlyZWQgZmllbGRzIGluIHRoZSByZXF1ZXN0IGJvZHlcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXEgRXhwcmVzcyByZXF1ZXN0IG9iamVjdFxuICogQHBhcmFtIHtBcnJheTxzdHJpbmc+fSByZXF1aXJlZEZpZWxkcyBBcnJheSBvZiByZXF1aXJlZCBmaWVsZCBuYW1lc1xuICogQHRocm93cyB7RXJyb3J9IElmIGFueSByZXF1aXJlZCBmaWVsZHMgYXJlIG1pc3NpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWRGaWVsZHMocmVxLCByZXF1aXJlZEZpZWxkcykge1xuICBpZiAoIXJlcS5ib2R5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1ZXN0IGJvZHkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBcbiAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IHJlcXVpcmVkRmllbGRzLmZpbHRlcihmaWVsZCA9PiAhcmVxLmJvZHkuaGFzT3duUHJvcGVydHkoZmllbGQpKTtcbiAgXG4gIGlmIChtaXNzaW5nRmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiAke21pc3NpbmdGaWVsZHMuam9pbignLCAnKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byB2YWxpZGF0ZSBhbiBJRCBwYXJhbWV0ZXIgZnJvbSBVUkxcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXEgRXhwcmVzcyByZXF1ZXN0IG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtTmFtZSBUaGUgbmFtZSBvZiB0aGUgSUQgcGFyYW1ldGVyIChkZWZhdWx0cyB0byAnaWQnKVxuICogQHJldHVybnMge251bWJlcn0gVGhlIHBhcnNlZCBJRFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBJRCBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUlkKHJlcSwgcGFyYW1OYW1lID0gJ2lkJykge1xuICBjb25zdCBpZCA9IHBhcnNlSW50KHJlcS5wYXJhbXNbcGFyYW1OYW1lXSk7XG4gIFxuICBpZiAoaXNOYU4oaWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkICR7cGFyYW1OYW1lfSBwYXJhbWV0ZXIuIEV4cGVjdGVkIGEgbnVtYmVyLmApO1xuICB9XG4gIFxuICByZXR1cm4gaWQ7XG59IiwgIi8vIEFQSSBlbmRwb2ludCBmb3IgbWFuYWdpbmcgYXBwbGljYXRpb24gc2V0dGluZ3NcbmltcG9ydCB7IHN0b3JhZ2UgfSBmcm9tICcuL19zdG9yYWdlJztcbmltcG9ydCB7IHdpdGhFcnJvckhhbmRsZXIgfSBmcm9tICcuL19lcnJvci1oYW5kbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgd2l0aEVycm9ySGFuZGxlcihhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIC8vIEdFVCAtIFJldHJpZXZlIGFsbCBzZXR0aW5nc1xuICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICB0cnkge1xuICAgICAgLy8gR2V0IGRheSBzdGFydCB0aW1lIHNldHRpbmdcbiAgICAgIGNvbnN0IGRheVN0YXJ0VGltZSA9IGF3YWl0IHN0b3JhZ2UuZ2V0RGF5U3RhcnRUaW1lKCk7XG4gICAgICBcbiAgICAgIC8vIEFkZGl0aW9uYWwgc2V0dGluZ3MgY2FuIGJlIGFkZGVkIGhlcmUgaW4gdGhlIGZ1dHVyZVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oe1xuICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgIGRheVN0YXJ0VGltZSxcbiAgICAgICAgICAvLyBBZGQgbW9yZSBzZXR0aW5ncyBoZXJlIGFzIG5lZWRlZFxuICAgICAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgICAgZGVmYXVsdENhdGVnb3JpZXM6IFsnSGVhbHRoJywgJ0NhcmVlcicsICdGaW5hbmNlcycsICdQZXJzb25hbCcsICdBbmFseXRpY3MnXVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciByZXRyaWV2aW5nIHNldHRpbmdzOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBNZXRob2Qgbm90IGFsbG93ZWRcbiAgcmVzLnNldEhlYWRlcignQWxsb3cnLCBbJ0dFVCddKTtcbiAgcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogYE1ldGhvZCAke3JlcS5tZXRob2R9IE5vdCBBbGxvd2VkYCB9KTtcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFDQSxTQUFTLGVBQWU7OztBQ3VCeEIsSUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsSUFBTSxZQUFZLG9CQUFJLElBQUk7QUFDMUIsSUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsSUFBTSxVQUFVLG9CQUFJLElBQUk7QUFHeEIsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxpQkFBaUI7QUFDckIsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxnQkFBZ0I7QUFHcEIsSUFBTSx5QkFBeUI7QUFDL0IsSUFBSSxlQUFlO0FBR1osSUFBTSwwQkFBMEIsTUFBTTtBQUUzQyxNQUFJLFNBQVMsU0FBUyxLQUFLLFVBQVUsU0FBUyxLQUFLLFNBQVMsU0FBUyxHQUFHO0FBQ3RFLDBCQUFzQjtBQUFBLEVBQ3hCO0FBRUEsU0FBTztBQUFBO0FBQUEsSUFFTCxNQUFNLFFBQVEsSUFBSTtBQUNoQixhQUFPLFFBQVEsSUFBSSxFQUFFLEtBQUs7QUFBQSxJQUM1QjtBQUFBLElBRUEsTUFBTSxrQkFBa0IsVUFBVTtBQUVoQyxpQkFBVyxRQUFRLFFBQVEsT0FBTyxHQUFHO0FBQ25DLFlBQUksS0FBSyxTQUFTLFlBQVksTUFBTSxTQUFTLFlBQVksR0FBRztBQUMxRCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE1BQU0sV0FBVyxVQUFVO0FBQ3pCLFlBQU0sS0FBSztBQUNYLFlBQU0sT0FBTztBQUFBLFFBQ1gsR0FBRztBQUFBLFFBQ0g7QUFBQSxRQUNBLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxRQUNsQyxZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsTUFDcEM7QUFDQSxjQUFRLElBQUksSUFBSSxJQUFJO0FBQ3BCLGFBQU87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VztBQUFBLFFBQzdFO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxTQUFTLE9BQU87QUFDZCxZQUFNLElBQUksTUFBTSw4QkFBOEIsTUFBTSxPQUFPLEVBQUU7QUFBQSxJQUMvRDtBQUFBLEVBQ0Y7QUFHQSxNQUFJLFVBQVUsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUM5QixNQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLE1BQU0sU0FBUyxVQUFVLElBQUksTUFBTSxlQUFlLENBQUM7QUFDbkYsQ0FBQzs7O0FMdkJELElBQU0sbUJBQW1CLE9BQU8sS0FBSyxZQUFZO0FBRS9DLFFBQU0sVUFBVTtBQUFBLElBQ2QsUUFBUSxJQUFJO0FBQUEsSUFDWixLQUFLLElBQUk7QUFBQSxJQUNULE1BQU0sSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0FBQUEsSUFDdkIsT0FBTyxPQUFPLFlBQVksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLFlBQVk7QUFBQSxJQUN2RCxTQUFTLE9BQU8sWUFBWSxJQUFJLE9BQU87QUFBQSxJQUN2QyxNQUFNLElBQUksT0FBTyxNQUFNLElBQUksS0FBSyxJQUFJO0FBQUEsSUFDcEMsUUFBUSxRQUFRLFVBQVUsQ0FBQztBQUFBLEVBQzdCO0FBRUEsTUFBSSxhQUFhO0FBQ2pCLE1BQUksZUFBZSxDQUFDO0FBQ3BCLE1BQUksa0JBQWtCLENBQUM7QUFHdkIsUUFBTSxVQUFVO0FBQUEsSUFDZCxRQUFRLENBQUMsU0FBUztBQUNoQixtQkFBYTtBQUNiLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLENBQUMsU0FBUztBQUNkLHFCQUFlO0FBQ2Ysc0JBQWdCLGNBQWMsSUFBSTtBQUNsQyxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsTUFBTSxDQUFDLFNBQVM7QUFDZCxxQkFBZTtBQUNmLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxXQUFXLENBQUMsTUFBTSxVQUFVO0FBQzFCLHNCQUFnQixJQUFJLElBQUk7QUFDeEIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLEtBQUssQ0FBQyxNQUFNLFVBQVU7QUFDcEIsc0JBQWdCLElBQUksSUFBSTtBQUN4QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsS0FBSyxNQUFNO0FBQUEsSUFBQztBQUFBLEVBQ2Q7QUFHQSxRQUFNLGlCQUFnQixTQUFTLE9BQU87QUFHdEMsU0FBTyxJQUFJO0FBQUEsSUFDVCxPQUFPLGlCQUFpQixXQUFXLEtBQUssVUFBVSxZQUFZLElBQUk7QUFBQSxJQUNsRTtBQUFBLE1BQ0UsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPQyxvQkFBUSxPQUFPLEtBQUssWUFBWTtBQUNyQyxTQUFPLGlCQUFpQixLQUFLLE9BQU87QUFDdEM7QUFHTyxJQUFNLFNBQVM7QUFBQSxFQUNwQixNQUFNO0FBQ1I7IiwKICAibmFtZXMiOiBbImlzSGFiaXRBY3RpdmVUb2RheSIsICJoYW5kbGVyIiwgImRheVN0YXJ0VGltZSIsICJzZXR0aW5nc19kZWZhdWx0Il0KfQo=
