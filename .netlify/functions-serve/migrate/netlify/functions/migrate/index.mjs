
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/migrate/index.js
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

// netlify/api/migrate.js
async function handler(req, res) {
  if (req.method === "POST") {
    try {
      return res.status(200).json({
        success: true,
        message: "Migration operation completed successfully",
        details: "This endpoint is primarily for development purposes"
      });
    } catch (error) {
      throw new Error(`Error during migration: ${error.message}`);
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

// netlify/functions/migrate/index.js
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
var migrate_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/migrate"
};
export {
  config,
  migrate_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvbWlncmF0ZS9pbmRleC5qcyIsICJuZXRsaWZ5L2FwaS9uZXRsaWZ5LWFkYXB0ZXIuanMiLCAibmV0bGlmeS9hcGkvcGctbmV0bGlmeS1hZGFwdGVyLmpzIiwgIm5ldGxpZnkvYXBpL19zdG9yYWdlLmpzIiwgIm5ldGxpZnkvYXBpL21pZ3JhdGUuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgZm9yIG1pZ3JhdGUgQVBJXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xuLy8gRml4OiBVc2UgYWJzb2x1dGUgcGF0aCByZWZlcmVuY2UgZm9yIHJlbGlhYmxlIGltcG9ydHNcbmltcG9ydCBvcmlnaW5hbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL25ldGxpZnkvYXBpL21pZ3JhdGUuanNcIjtcblxuLy8gRXhwcmVzcyBhZGFwdGVyIHRvIGNvbnZlcnQgUmVxdWVzdC9SZXNwb25zZSBvYmplY3RzXG5jb25zdCBleHByZXNzVG9OZXRsaWZ5ID0gYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xuICAvLyBNb2NrIEV4cHJlc3MtbGlrZSBvYmplY3RzXG4gIGNvbnN0IG1vY2tSZXEgPSB7XG4gICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgIHVybDogcmVxLnVybCxcbiAgICBwYXRoOiBuZXcgVVJMKHJlcS51cmwpLnBhdGhuYW1lLFxuICAgIHF1ZXJ5OiBPYmplY3QuZnJvbUVudHJpZXMobmV3IFVSTChyZXEudXJsKS5zZWFyY2hQYXJhbXMpLFxuICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXEuaGVhZGVycyksXG4gICAgYm9keTogcmVxLmJvZHkgPyBhd2FpdCByZXEuanNvbigpIDogdW5kZWZpbmVkLFxuICAgIHBhcmFtczogY29udGV4dC5wYXJhbXMgfHwge31cbiAgfTtcbiAgXG4gIGxldCBzdGF0dXNDb2RlID0gMjAwO1xuICBsZXQgcmVzcG9uc2VCb2R5ID0ge307XG4gIGxldCByZXNwb25zZUhlYWRlcnMgPSB7fTtcbiAgXG4gIC8vIE1vY2sgRXhwcmVzcyByZXNwb25zZVxuICBjb25zdCBtb2NrUmVzID0ge1xuICAgIHN0YXR1czogKGNvZGUpID0+IHtcbiAgICAgIHN0YXR1c0NvZGUgPSBjb2RlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBqc29uOiAoYm9keSkgPT4ge1xuICAgICAgcmVzcG9uc2VCb2R5ID0gYm9keTtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIHNlbmQ6IChib2R5KSA9PiB7XG4gICAgICByZXNwb25zZUJvZHkgPSBib2R5O1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZXRIZWFkZXI6IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIHNldDogKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICByZXNwb25zZUhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgZW5kOiAoKSA9PiB7fVxuICB9O1xuICBcbiAgLy8gQ2FsbCB0aGUgb3JpZ2luYWwgRXhwcmVzcyBoYW5kbGVyXG4gIGF3YWl0IG9yaWdpbmFsSGFuZGxlcihtb2NrUmVxLCBtb2NrUmVzKTtcbiAgXG4gIC8vIENvbnZlcnQgdG8gTmV0bGlmeSBSZXNwb25zZVxuICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgIHR5cGVvZiByZXNwb25zZUJvZHkgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VCb2R5KSA6IHJlc3BvbnNlQm9keSxcbiAgICB7XG4gICAgICBzdGF0dXM6IHN0YXR1c0NvZGUsXG4gICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnNcbiAgICB9XG4gICk7XG59O1xuXG4vLyBNb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbiBoYW5kbGVyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxLCBjb250ZXh0KSA9PiB7XG4gIHJldHVybiBleHByZXNzVG9OZXRsaWZ5KHJlcSwgY29udGV4dCk7XG59O1xuXG4vLyBDb25maWd1cmUgcm91dGluZ1xuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgcGF0aDogXCIvYXBpL21pZ3JhdGVcIlxufTtcbiIsICIvKipcbiAqIE5ldGxpZnkgRnVuY3Rpb25zIFN0b3JhZ2UgQWRhcHRlciAoTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb25zIENvbXBhdGlibGUpXG4gKiBcbiAqIEluLW1lbW9yeSBzdG9yYWdlIGltcGxlbWVudGF0aW9uIHNwZWNpZmljYWxseSBvcHRpbWl6ZWQgZm9yIE5ldGxpZnkncyBzZXJ2ZXJsZXNzIGVudmlyb25tZW50LlxuICogVGhpcyBhZGFwdGVyIGlzIGRlc2lnbmVkIHRvIHdvcmsgd2l0aCB0aGUgbW9kZXJuIE5ldGxpZnkgRnVuY3Rpb25zIEFQSSBhbmQgcHJvdmlkZXM6XG4gKiBcbiAqIDEuIFBlcnNpc3RlbnQgaW4tbWVtb3J5IHN0b3JhZ2UgYWNyb3NzIGZ1bmN0aW9uIGludm9jYXRpb25zICh3aXRoaW4gdGhlIHNhbWUgZnVuY3Rpb24gaW5zdGFuY2UpXG4gKiAyLiBDb21wYXRpYmlsaXR5IHdpdGggTmV0bGlmeSdzIHJlYWQtb25seSBmaWxlc3lzdGVtXG4gKiAzLiBBdXRvbWF0aWMgaW5pdGlhbGl6YXRpb24gd2l0aCBkZWZhdWx0IGRhdGFcbiAqIDQuIENvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBzdG9yYWdlIGludGVyZmFjZVxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEluLW1lbW9yeSBzdG9yYWdlIG1hcHNcbmNvbnN0IHRhc2tzTWFwID0gbmV3IE1hcCgpO1xuY29uc3QgaGFiaXRzTWFwID0gbmV3IE1hcCgpO1xuY29uc3Qgbm90ZXNNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCB1c2VyTWFwID0gbmV3IE1hcCgpO1xuXG4vLyBDb3VudGVyIGZvciBnZW5lcmF0aW5nIElEc1xubGV0IHRhc2tDdXJyZW50SWQgPSAxO1xubGV0IGhhYml0Q3VycmVudElkID0gMTtcbmxldCBub3RlQ3VycmVudElkID0gMTtcbmxldCB1c2VyQ3VycmVudElkID0gMTtcblxuLy8gRGF5IHN0YXJ0IHRpbWUgc2V0dGluZ1xuY29uc3QgREVGQVVMVF9EQVlfU1RBUlRfVElNRSA9ICcwNDowMCc7IC8vIDQgQU0gZGVmYXVsdFxubGV0IGRheVN0YXJ0VGltZSA9IERFRkFVTFRfREFZX1NUQVJUX1RJTUU7XG5cbi8vIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlcnZlcmxlc3NTdG9yYWdlID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXplIHdpdGggZGVmYXVsdCBkYXRhXG4gIGlmICh0YXNrc01hcC5zaXplID09PSAwICYmIGhhYml0c01hcC5zaXplID09PSAwICYmIG5vdGVzTWFwLnNpemUgPT09IDApIHtcbiAgICBpbml0aWFsaXplRGVmYXVsdERhdGEoKTtcbiAgfVxuICBcbiAgcmV0dXJuIHtcbiAgICAvLyBVc2VyIG1ldGhvZHNcbiAgICBhc3luYyBnZXRVc2VyKGlkKSB7XG4gICAgICByZXR1cm4gdXNlck1hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICAgICAgLy8gRmluZCB0aGUgdXNlciB3aXRoIHRoZSBnaXZlbiB1c2VybmFtZVxuICAgICAgZm9yIChjb25zdCB1c2VyIG9mIHVzZXJNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKHVzZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gdXNlcm5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVVzZXIodXNlckRhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gdXNlckN1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgdXNlciA9IHsgXG4gICAgICAgIC4uLnVzZXJEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHVzZXJNYXAuc2V0KGlkLCB1c2VyKTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH0sXG4gICAgXG4gICAgLy8gVGFzayBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VGFza3MoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0YXNrc01hcC52YWx1ZXMoKSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAvLyBDb21wbGV0ZWQgdGFza3Mgc2hvdWxkIGFwcGVhciBhZnRlciBub24tY29tcGxldGVkIHRhc2tzXG4gICAgICAgIGlmIChhLmNvbXBsZXRlZCAhPT0gYi5jb21wbGV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gYS5jb21wbGV0ZWQgPyAxIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU29ydCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShiLmNyZWF0ZWRBdCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFRhc2soaWQpIHtcbiAgICAgIHJldHVybiB0YXNrc01hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVUYXNrKHRhc2tEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IHRhc2tDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IHRhc2sgPSB7IFxuICAgICAgICAuLi50YXNrRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICB0YXNrc01hcC5zZXQoaWQsIHRhc2spO1xuICAgICAgcmV0dXJuIHRhc2s7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVUYXNrKGlkLCB0YXNrRGF0YSkge1xuICAgICAgY29uc3QgdGFzayA9IHRhc2tzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIXRhc2spIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkVGFzayA9IHsgXG4gICAgICAgIC4uLnRhc2ssIFxuICAgICAgICAuLi50YXNrRGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHRhc2tzTWFwLnNldChpZCwgdXBkYXRlZFRhc2spO1xuICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlVGFzayhpZCkge1xuICAgICAgY29uc3QgdGFzayA9IHRhc2tzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIXRhc2spIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgdGFza3NNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gSGFiaXQgbWV0aG9kc1xuICAgIGFzeW5jIGdldEhhYml0cygpIHtcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBoYWJpdHNBcnJheSA9IEFycmF5LmZyb20oaGFiaXRzTWFwLnZhbHVlcygpKTtcbiAgICAgIFxuICAgICAgLy8gQWRkIGlzQWN0aXZlVG9kYXkgZmllbGQgdG8gZWFjaCBoYWJpdFxuICAgICAgcmV0dXJuIGhhYml0c0FycmF5Lm1hcChoYWJpdCA9PiAoe1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfSkpO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVIYWJpdChoYWJpdERhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gaGFiaXRDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IGhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXREYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLCAvLyAncGVuZGluZycsICdjb21wbGV0ZWQnLCAnZmFpbGVkJ1xuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIGhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlSGFiaXQoaWQsIGhhYml0RGF0YSkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIC4uLmhhYml0RGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY29tcGxldGVIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZhaWxIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHJlc2V0SGFiaXRTdGF0dXMoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgaW5jcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHR5cGVvZiBoYWJpdC5jdXJyZW50VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQuY3VycmVudFZhbHVlIDogMDtcbiAgICAgIGNvbnN0IG1heFZhbHVlID0gdHlwZW9mIGhhYml0Lm1heFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0Lm1heFZhbHVlIDogSW5maW5pdHk7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWluKGN1cnJlbnRWYWx1ZSArIDEsIG1heFZhbHVlKTtcbiAgICAgIFxuICAgICAgY29uc3Qgc3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBjdXJyZW50VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0eXBlb2YgaGFiaXQuY3VycmVudFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0LmN1cnJlbnRWYWx1ZSA6IDA7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWF4KGN1cnJlbnRWYWx1ZSAtIDEsIDApO1xuICAgICAgXG4gICAgICBjb25zdCBtYXhWYWx1ZSA9IHR5cGVvZiBoYWJpdC5tYXhWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5tYXhWYWx1ZSA6IEluZmluaXR5O1xuICAgICAgY29uc3Qgc3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBjdXJyZW50VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZUhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gTm90ZSBtZXRob2RzXG4gICAgYXN5bmMgZ2V0Tm90ZXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShub3Rlc01hcC52YWx1ZXMoKSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAvLyBTb3J0IGJ5IGNyZWF0aW9uIGRhdGUgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIuY3JlYXRlZEF0KSAtIG5ldyBEYXRlKGEuY3JlYXRlZEF0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5Q2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICAgIC8vIEZpbmQgdGhlIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gY2F0ZWdvcnkgKGNhc2UtaW5zZW5zaXRpdmUpXG4gICAgICBmb3IgKGNvbnN0IG5vdGUgb2Ygbm90ZXNNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKG5vdGUuY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSA9PT0gY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiBub3RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZU5vdGUobm90ZURhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gbm90ZUN1cnJlbnRJZCsrO1xuICAgICAgY29uc3Qgbm90ZSA9IHsgXG4gICAgICAgIC4uLm5vdGVEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuc2V0KGlkLCBub3RlKTtcbiAgICAgIHJldHVybiBub3RlO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlTm90ZShpZCwgbm90ZURhdGEpIHtcbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFub3RlKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZE5vdGUgPSB7IFxuICAgICAgICAuLi5ub3RlLCBcbiAgICAgICAgLi4ubm90ZURhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBub3Rlc01hcC5zZXQoaWQsIHVwZGF0ZWROb3RlKTtcbiAgICAgIHJldHVybiB1cGRhdGVkTm90ZTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUlkKGlkKSB7XG4gICAgICByZXR1cm4gbm90ZXNNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlTm90ZShpZCkge1xuICAgICAgY29uc3Qgbm90ZSA9IG5vdGVzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIW5vdGUpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gU2V0dGluZ3NcbiAgICBhc3luYyBnZXREYXlTdGFydFRpbWUoKSB7XG4gICAgICByZXR1cm4gZGF5U3RhcnRUaW1lIHx8IERFRkFVTFRfREFZX1NUQVJUX1RJTUU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBzZXREYXlTdGFydFRpbWUodGltZSkge1xuICAgICAgZGF5U3RhcnRUaW1lID0gdGltZTtcbiAgICAgIHJldHVybiBkYXlTdGFydFRpbWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBEYWlseSBkYXRhIGxvZ2dpbmdcbiAgICBhc3luYyBsb2dEYWlseURhdGEoZGF0ZVN0ciwgcmVzZXRIYWJpdHMgPSB0cnVlKSB7XG4gICAgICBpZiAocmVzZXRIYWJpdHMpIHtcbiAgICAgICAgLy8gUmVzZXQgYWxsIGJvb2xlYW4gaGFiaXRzIHRvIHBlbmRpbmdcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIGhhYml0XSBvZiBoYWJpdHNNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKGhhYml0LnR5cGUgPT09ICdib29sZWFuJyAmJiBoYWJpdC5zdGF0dXMgIT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgaGFiaXRzTWFwLnNldChpZCwge1xuICAgICAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGNvdW50ZXIgaGFiaXRzIHRvIDBcbiAgICAgICAgICBpZiAoaGFiaXQudHlwZSA9PT0gJ2NvdW50ZXInKSB7XG4gICAgICAgICAgICBoYWJpdHNNYXAuc2V0KGlkLCB7XG4gICAgICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgICAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBoYWJpdCBpcyBhY3RpdmUgb24gYSBnaXZlbiBkYXlcbmZ1bmN0aW9uIGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdCkge1xuICBpZiAoIWhhYml0LnJlcGVhdFR5cGUpIHJldHVybiB0cnVlO1xuICBcbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKTsgLy8gMCA9IFN1bmRheSwgMSA9IE1vbmRheSwgZXRjLlxuICBcbiAgaWYgKGhhYml0LnJlcGVhdFR5cGUgPT09ICdkYWlseScpIHtcbiAgICAvLyBGb3IgZGFpbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IGV2ZXJ5IGRheSBvciBvbmx5IG9uIHNwZWNpZmljIGRheXNcbiAgICBpZiAoaGFiaXQucmVwZWF0RGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gaGFiaXQucmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRUeXBlID09PSAnd2Vla2x5Jykge1xuICAgIC8vIEZvciB3ZWVrbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IG9uIHRoaXMgZGF5IG9mIHRoZSB3ZWVrXG4gICAgaWYgKGhhYml0LnJlcGVhdERheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIGhhYml0LnJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gSW5pdGlhbGl6ZSB3aXRoIHNvbWUgZXhhbXBsZSBkYXRhXG5mdW5jdGlvbiBpbml0aWFsaXplRGVmYXVsdERhdGEoKSB7XG4gIC8vIENyZWF0ZSBzb21lIGRlZmF1bHQgaGFiaXRzXG4gIGNvbnN0IGhhYml0MSA9IHtcbiAgICBpZDogaGFiaXRDdXJyZW50SWQrKyxcbiAgICBuYW1lOiAnTW9ybmluZyBFeGVyY2lzZScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIHJlcGVhdFR5cGU6ICdkYWlseScsXG4gICAgcmVwZWF0RGF5czogJyonLFxuICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBoYWJpdDIgPSB7XG4gICAgaWQ6IGhhYml0Q3VycmVudElkKyssXG4gICAgbmFtZTogJ0RyaW5rIHdhdGVyJyxcbiAgICB0eXBlOiAnY291bnRlcicsXG4gICAgbWF4VmFsdWU6IDgsXG4gICAgY3VycmVudFZhbHVlOiAwLFxuICAgIHJlcGVhdFR5cGU6ICdkYWlseScsXG4gICAgcmVwZWF0RGF5czogJyonLFxuICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBoYWJpdHNNYXAuc2V0KGhhYml0MS5pZCwgaGFiaXQxKTtcbiAgaGFiaXRzTWFwLnNldChoYWJpdDIuaWQsIGhhYml0Mik7XG4gIFxuICAvLyBDcmVhdGUgZGVmYXVsdCB0YXNrXG4gIGNvbnN0IHRhc2sgPSB7XG4gICAgaWQ6IHRhc2tDdXJyZW50SWQrKyxcbiAgICB0ZXh0OiAnQ3JlYXRlIHByb2plY3QgcGxhbicsXG4gICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgdGFza3NNYXAuc2V0KHRhc2suaWQsIHRhc2spO1xuICBcbiAgLy8gQ3JlYXRlIGRlZmF1bHQgbm90ZXNcbiAgY29uc3Qgbm90ZTEgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0hlYWx0aCcsXG4gICAgY29udGVudDogJyMgSGVhbHRoIEdvYWxzXFxuXFxuLSBJbXByb3ZlIHNsZWVwIHNjaGVkdWxlXFxuLSBEcmluayBtb3JlIHdhdGVyXFxuLSBFeGVyY2lzZSAzIHRpbWVzIGEgd2VlaycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGUyID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdDYXJlZXInLFxuICAgIGNvbnRlbnQ6ICcjIENhcmVlciBOb3Rlc1xcblxcbi0gVXBkYXRlIHJlc3VtZVxcbi0gTmV0d29yayB3aXRoIGluZHVzdHJ5IHByb2Zlc3Npb25hbHNcXG4tIExlYXJuIG5ldyBza2lsbHMnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlMyA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnRmluYW5jZXMnLFxuICAgIGNvbnRlbnQ6ICcjIEZpbmFuY2lhbCBHb2Fsc1xcblxcbi0gU2F2ZSAyMCUgb2YgaW5jb21lXFxuLSBSZXZpZXcgYnVkZ2V0IG1vbnRobHlcXG4tIFJlc2VhcmNoIGludmVzdG1lbnQgb3B0aW9ucycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGU0ID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdQZXJzb25hbCcsXG4gICAgY29udGVudDogJyMgUGVyc29uYWwgRGV2ZWxvcG1lbnRcXG5cXG4tIFJlYWQgb25lIGJvb2sgcGVyIG1vbnRoXFxuLSBQcmFjdGljZSBtZWRpdGF0aW9uXFxuLSBTcGVuZCBxdWFsaXR5IHRpbWUgd2l0aCBmYW1pbHknLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBub3Rlc01hcC5zZXQobm90ZTEuaWQsIG5vdGUxKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGUyLmlkLCBub3RlMik7XG4gIG5vdGVzTWFwLnNldChub3RlMy5pZCwgbm90ZTMpO1xuICBub3Rlc01hcC5zZXQobm90ZTQuaWQsIG5vdGU0KTtcbn1cblxuLy8gRXhwb3J0IHRoZSBuZXRsaWZ5IHN0b3JhZ2Ugc2luZ2xldG9uXG5leHBvcnQgY29uc3QgbmV0bGlmeVN0b3JhZ2UgPSBjcmVhdGVTZXJ2ZXJsZXNzU3RvcmFnZSgpOyIsICIvKipcbiAqIFBvc3RncmVTUUwgQWRhcHRlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnNcbiAqIFxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgYSBQb3N0Z3JlU1FMLWJhc2VkIGltcGxlbWVudGF0aW9uIG9mIHRoZSBzdG9yYWdlIGludGVyZmFjZVxuICogZm9yIE5ldGxpZnkgRnVuY3Rpb25zLiBJdCBjb25uZWN0cyBkaXJlY3RseSB0byB0aGUgUG9zdGdyZVNRTCBkYXRhYmFzZSB1c2luZ1xuICogdGhlIERBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbXBvcnQgdGhlIHBnIG1vZHVsZVxuaW1wb3J0IHBrZyBmcm9tICdwZyc7XG5jb25zdCB7IFBvb2wgfSA9IHBrZztcblxuLy8gQ3JlYXRlIGEgY29ubmVjdGlvbiBwb29sXG5sZXQgcG9vbDtcblxuLy8gRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBQb3N0Z3JlU1FMLWJhc2VkIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjcmVhdGVQZ1N0b3JhZ2UgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpemUgcG9vbCBpZiBub3QgYWxyZWFkeSBjcmVhdGVkXG4gIGlmICghcG9vbCkge1xuICAgIGNvbnN0IGRhdGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMO1xuICAgIFxuICAgIGlmICghZGF0YWJhc2VVcmwpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbWlzc2luZycpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgSW5pdGlhbGl6aW5nIFBvc3RncmVTUUwgY29ubmVjdGlvbiAoVVJMIGxlbmd0aDogJHtkYXRhYmFzZVVybC5sZW5ndGh9KWApO1xuICAgIFxuICAgIHBvb2wgPSBuZXcgUG9vbCh7XG4gICAgICBjb25uZWN0aW9uU3RyaW5nOiBkYXRhYmFzZVVybCxcbiAgICAgIC8vIEVuYWJsZSBTU0wgd2l0aCByZWplY3RVbmF1dGhvcml6ZWQgc2V0IHRvIGZhbHNlIGZvciBOZXRsaWZ5XG4gICAgICBzc2w6IHtcbiAgICAgICAgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGVzdCB0aGUgY29ubmVjdGlvblxuICAgIHBvb2wucXVlcnkoJ1NFTEVDVCBOT1coKScpXG4gICAgICAudGhlbigoKSA9PiBjb25zb2xlLmxvZygnUG9zdGdyZVNRTCBkYXRhYmFzZSBjb25uZWN0aW9uIHN1Y2Nlc3NmdWwnKSlcbiAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQb3N0Z3JlU1FMIGNvbm5lY3Rpb24gZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTdGFjayB0cmFjZTonLCBlcnIuc3RhY2spO1xuICAgICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIFVzZXIgbWV0aG9kc1xuICAgIGFzeW5jIGdldFVzZXIoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFVzZXI6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIHVzZXJuYW1lID0gJDEnLFxuICAgICAgICAgIFt1c2VybmFtZV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRVc2VyQnlVc2VybmFtZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVXNlcih1c2VyRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gdXNlcnMgKHVzZXJuYW1lLCBwYXNzd29yZCkgVkFMVUVTICgkMSwgJDIpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbdXNlckRhdGEudXNlcm5hbWUsIHVzZXJEYXRhLnBhc3N3b3JkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVVc2VyOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBUYXNrIG1ldGhvZHNcbiAgICBhc3luYyBnZXRUYXNrcygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gdGFza3MgT1JERVIgQlkgY29tcGxldGVkIEFTQywgY3JlYXRlZF9hdCBERVNDJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93cztcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFRhc2tzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRUYXNrKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHRhc2tzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVUYXNrKHRhc2tEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgdGFzayB3aXRoIGRhdGE6JywgSlNPTi5zdHJpbmdpZnkodGFza0RhdGEpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEV4dHJhY3QgdGFzayBwcm9wZXJ0aWVzIHdpdGggZGVmYXVsdHNcbiAgICAgICAgY29uc3QgdGV4dCA9IHRhc2tEYXRhLnRleHQ7XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IHRhc2tEYXRhLmNvbXBsZXRlZCB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gdGFza0RhdGEuY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGFza0RhdGEudXNlcklkIHx8IG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyB0YXNrcyAodGV4dCwgY29tcGxldGVkLCBjcmVhdGVkX2F0LCB1c2VyX2lkKSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0KSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW3RleHQsIGNvbXBsZXRlZCwgY3JlYXRlZEF0LCB1c2VySWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZXRhaWxzOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTdGFjayB0cmFjZTonLCBlcnJvci5zdGFjayk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlVGFzayhpZCwgdGFza0RhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAoJ3RleHQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGB0ZXh0ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NvbXBsZXRlZCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNvbXBsZXRlZCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS5jb21wbGV0ZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NyZWF0ZWRBdCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNyZWF0ZWRfYXQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCd1c2VySWQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGB1c2VyX2lkID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLnVzZXJJZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgdGFza3NcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZVRhc2soaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIHRhc2tzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBIYWJpdCBtZXRob2RzXG4gICAgYXN5bmMgZ2V0SGFiaXRzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSBoYWJpdHMnKTtcbiAgICAgICAgY29uc3QgaGFiaXRzID0gcmVzdWx0LnJvd3M7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgaXNBY3RpdmVUb2RheSBmaWVsZCB0byBlYWNoIGhhYml0XG4gICAgICAgIHJldHVybiBoYWJpdHMubWFwKGhhYml0ID0+ICh7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9KSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRIYWJpdHM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZUhhYml0KGhhYml0RGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ29udmVydCBhcnJheSB0byBzdHJpbmcgZm9yIGRhdGFiYXNlIHN0b3JhZ2UgaWYgbmVlZGVkXG4gICAgICAgIGxldCByZXBlYXREYXlzID0gaGFiaXREYXRhLnJlcGVhdERheXM7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlcGVhdERheXMpKSB7XG4gICAgICAgICAgcmVwZWF0RGF5cyA9IHJlcGVhdERheXMuam9pbignLCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgIGBJTlNFUlQgSU5UTyBoYWJpdHMgKFxuICAgICAgICAgICAgbmFtZSwgdHlwZSwgdmFsdWUsIG1heF92YWx1ZSwgc3RhdHVzLCByZXBlYXRfdHlwZSwgcmVwZWF0X2RheXMsIHVzZXJfaWQsIGxhc3RfcmVzZXRcbiAgICAgICAgICApIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4LCAkOSkgUkVUVVJOSU5HICpgLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGhhYml0RGF0YS5uYW1lLFxuICAgICAgICAgICAgaGFiaXREYXRhLnR5cGUgfHwgJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgaGFiaXREYXRhLnZhbHVlIHx8IDAsXG4gICAgICAgICAgICBoYWJpdERhdGEubWF4VmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5zdGF0dXMgfHwgJ3BlbmRpbmcnLFxuICAgICAgICAgICAgaGFiaXREYXRhLnJlcGVhdFR5cGUgfHwgJ2RhaWx5JyxcbiAgICAgICAgICAgIHJlcGVhdERheXMgfHwgJyonLFxuICAgICAgICAgICAgaGFiaXREYXRhLnVzZXJJZCB8fCBudWxsLFxuICAgICAgICAgICAgaGFiaXREYXRhLmxhc3RSZXNldCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICBdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVIYWJpdChpZCwgaGFiaXREYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIHJlcGVhdERheXMgc3BlY2lhbGx5IC0gY29udmVydCBhcnJheSB0byBzdHJpbmdcbiAgICAgICAgaWYgKCdyZXBlYXREYXlzJyBpbiBoYWJpdERhdGEpIHtcbiAgICAgICAgICBsZXQgcmVwZWF0RGF5cyA9IGhhYml0RGF0YS5yZXBlYXREYXlzO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlcGVhdERheXMpKSB7XG4gICAgICAgICAgICByZXBlYXREYXlzID0gcmVwZWF0RGF5cy5qb2luKCcsJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwZGF0ZXMucHVzaChgcmVwZWF0X2RheXMgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gocmVwZWF0RGF5cyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IHtcbiAgICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgICAgdHlwZTogJ3R5cGUnLFxuICAgICAgICAgIHZhbHVlOiAndmFsdWUnLFxuICAgICAgICAgIG1heFZhbHVlOiAnbWF4X3ZhbHVlJyxcbiAgICAgICAgICBzdGF0dXM6ICdzdGF0dXMnLFxuICAgICAgICAgIHJlcGVhdFR5cGU6ICdyZXBlYXRfdHlwZScsXG4gICAgICAgICAgdXNlcklkOiAndXNlcl9pZCcsXG4gICAgICAgICAgbGFzdFJlc2V0OiAnbGFzdF9yZXNldCdcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBhbGwgdGhlIG90aGVyIGZpZWxkc1xuICAgICAgICBmb3IgKGNvbnN0IFtqc0ZpZWxkLCBkYkZpZWxkXSBvZiBPYmplY3QuZW50cmllcyhmaWVsZHMpKSB7XG4gICAgICAgICAgaWYgKGpzRmllbGQgaW4gaGFiaXREYXRhKSB7XG4gICAgICAgICAgICB1cGRhdGVzLnB1c2goYCR7ZGJGaWVsZH0gPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChoYWJpdERhdGFbanNGaWVsZF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSBoYWJpdHNcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjb21wbGV0ZUhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ2NvbXBsZXRlZCcsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNvbXBsZXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZhaWxIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydmYWlsZWQnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmYWlsSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHJlc2V0SGFiaXRTdGF0dXMoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsncGVuZGluZycsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHJlc2V0SGFiaXRTdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGluY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBGaXJzdCBnZXQgdGhlIGN1cnJlbnQgaGFiaXQgdG8gY2hlY2sgdGhlIHR5cGUgYW5kIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgICAgICBjb25zdCBoYWJpdFJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRSZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gaGFiaXQudmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWF4VmFsdWUgPSBoYWJpdC5tYXhfdmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1pbihjdXJyZW50VmFsdWUgKyAxLCBtYXhWYWx1ZSk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9ICQxLCBzdGF0dXMgPSAkMiBXSEVSRSBpZCA9ICQzIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbbmV3VmFsdWUsIG5ld1N0YXR1cywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCF1cGRhdGVkSGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGluY3JlbWVudEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gRmlyc3QgZ2V0IHRoZSBjdXJyZW50IGhhYml0IHRvIGNoZWNrIHRoZSB0eXBlIGFuZCBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFiaXRSZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IGhhYml0UmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGhhYml0LnZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG1heFZhbHVlID0gaGFiaXQubWF4X3ZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5tYXgoY3VycmVudFZhbHVlIC0gMSwgMCk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9ICQxLCBzdGF0dXMgPSAkMiBXSEVSRSBpZCA9ICQzIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbbmV3VmFsdWUsIG5ld1N0YXR1cywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCF1cGRhdGVkSGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlY3JlbWVudEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gTm90ZSBtZXRob2RzXG4gICAgYXN5bmMgZ2V0Tm90ZXMoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIG5vdGVzIE9SREVSIEJZIGNyZWF0ZWRfYXQgREVTQycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXROb3RlczonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5Q2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBGZXRjaGluZyBub3RlIGZvciBjYXRlZ29yeTogJHtjYXRlZ29yeX1gKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBub3RlcyBXSEVSRSBMT1dFUihjYXRlZ29yeSkgPSBMT1dFUigkMSknLFxuICAgICAgICAgIFtjYXRlZ29yeV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBnZXROb3RlQnlDYXRlZ29yeSBmb3IgJHtjYXRlZ29yeX06YCwgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUlkKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIG5vdGVzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXROb3RlQnlJZDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlTm90ZShub3RlRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgbm90ZSB3aXRoIHRoaXMgY2F0ZWdvcnkgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgY29uc3QgZXhpc3RpbmdOb3RlID0gYXdhaXQgdGhpcy5nZXROb3RlQnlDYXRlZ29yeShub3RlRGF0YS5jYXRlZ29yeSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZXhpc3RpbmdOb3RlKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIG5vdGVcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy51cGRhdGVOb3RlKGV4aXN0aW5nTm90ZS5pZCwge1xuICAgICAgICAgICAgY29udGVudDogbm90ZURhdGEuY29udGVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgbmV3IG5vdGUgaWYgbm9uZSBleGlzdHNcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gbm90ZXMgKGNhdGVnb3J5LCBjb250ZW50LCBjcmVhdGVkX2F0KSBWQUxVRVMgKCQxLCAkMiwgJDMpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBub3RlRGF0YS5jYXRlZ29yeSxcbiAgICAgICAgICAgIG5vdGVEYXRhLmNvbnRlbnQsXG4gICAgICAgICAgICBub3RlRGF0YS5jcmVhdGVkQXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVOb3RlKGlkLCBub3RlRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmICgnY2F0ZWdvcnknIGluIG5vdGVEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjYXRlZ29yeSA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChub3RlRGF0YS5jYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY29udGVudCcgaW4gbm90ZURhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNvbnRlbnQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gobm90ZURhdGEuY29udGVudCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgbm90ZXNcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZU5vdGUoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIG5vdGVzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBEYWlseSBkYXRhIGxvZ2dpbmdcbiAgICBhc3luYyBsb2dEYWlseURhdGEoZGF0ZVN0ciwgcmVzZXRIYWJpdHMgPSB0cnVlKSB7XG4gICAgICBpZiAocmVzZXRIYWJpdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBSZXNldCBhbGwgYm9vbGVhbiBoYWJpdHMgdG8gcGVuZGluZ1xuICAgICAgICAgIGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgICBcIlVQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICdwZW5kaW5nJyBXSEVSRSB0eXBlID0gJ2Jvb2xlYW4nXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlc2V0IGFsbCBjb3VudGVyIGhhYml0cyB0byAwXG4gICAgICAgICAgYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAgIFwiVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAwLCBzdGF0dXMgPSAncGVuZGluZycgV0hFUkUgdHlwZSA9ICdjb3VudGVyJ1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBsb2dEYWlseURhdGE6JywgZXJyb3IpO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIFNldHRpbmdzXG4gICAgYXN5bmMgZ2V0RGF5U3RhcnRUaW1lKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0IHRoZSBzZXR0aW5nIGZyb20gYSBzZXR0aW5ncyB0YWJsZSBvciByZXR1cm4gZGVmYXVsdFxuICAgICAgICByZXR1cm4gJzA0OjAwJzsgLy8gRGVmYXVsdCB0byA0IEFNXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXREYXlTdGFydFRpbWU6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gJzA0OjAwJzsgLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgc2V0RGF5U3RhcnRUaW1lKHRpbWUpIHtcbiAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgc2F2ZSB0byBkYXRhYmFzZVxuICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxuICB9O1xufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIGhhYml0IGlzIGFjdGl2ZSB0b2RheVxuZnVuY3Rpb24gaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KSB7XG4gIGlmICghaGFiaXQucmVwZWF0X3R5cGUpIHJldHVybiB0cnVlO1xuICBcbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKTsgLy8gMCA9IFN1bmRheSwgMSA9IE1vbmRheSwgZXRjLlxuICBcbiAgaWYgKGhhYml0LnJlcGVhdF90eXBlID09PSAnZGFpbHknKSB7XG4gICAgLy8gRm9yIGRhaWx5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBldmVyeSBkYXkgb3Igb25seSBvbiBzcGVjaWZpYyBkYXlzXG4gICAgaWYgKGhhYml0LnJlcGVhdF9kYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENvbnZlcnQgcmVwZWF0X2RheXMgdG8gYXJyYXkgaWYgaXQncyBhIHN0cmluZ1xuICAgIGNvbnN0IHJlcGVhdERheXMgPSB0eXBlb2YgaGFiaXQucmVwZWF0X2RheXMgPT09ICdzdHJpbmcnIFxuICAgICAgPyBoYWJpdC5yZXBlYXRfZGF5cy5zcGxpdCgnLCcpIFxuICAgICAgOiBoYWJpdC5yZXBlYXRfZGF5cztcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gcmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRfdHlwZSA9PT0gJ3dlZWtseScpIHtcbiAgICAvLyBGb3Igd2Vla2x5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBvbiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIGlmIChoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDb252ZXJ0IHJlcGVhdF9kYXlzIHRvIGFycmF5IGlmIGl0J3MgYSBzdHJpbmdcbiAgICBjb25zdCByZXBlYXREYXlzID0gdHlwZW9mIGhhYml0LnJlcGVhdF9kYXlzID09PSAnc3RyaW5nJyBcbiAgICAgID8gaGFiaXQucmVwZWF0X2RheXMuc3BsaXQoJywnKSBcbiAgICAgIDogaGFiaXQucmVwZWF0X2RheXM7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIHJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBwZ1N0b3JhZ2UgPSBjcmVhdGVQZ1N0b3JhZ2UoKTsiLCAiLyoqXG4gKiBTdG9yYWdlIGludGVyZmFjZSBmb3IgQVBJIGhhbmRsZXJzXG4gKiBUaGlzIGZpbGUgc2VydmVzIGFzIHRoZSBjZW50cmFsIGRhdGEgYWNjZXNzIGxheWVyIGZvciB0aGUgQVBJXG4gKiBcbiAqIFRoaXMgZmlsZSB1c2VzIHRoZSBQb3N0Z3JlU1FMIHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gZm9yIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRzXG4gKiBhbmQgZmFsbHMgYmFjayB0byBpbi1tZW1vcnkgc3RvcmFnZSBmb3IgZGV2ZWxvcG1lbnQgaWYgREFUQUJBU0VfVVJMIGlzIG5vdCBzZXQuXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW1wb3J0IGJvdGggc3RvcmFnZSBpbXBsZW1lbnRhdGlvbnNcbmltcG9ydCB7IG5ldGxpZnlTdG9yYWdlIH0gZnJvbSAnLi9uZXRsaWZ5LWFkYXB0ZXInO1xuaW1wb3J0IHsgcGdTdG9yYWdlIH0gZnJvbSAnLi9wZy1uZXRsaWZ5LWFkYXB0ZXInO1xuXG4vLyBEZWNpZGUgd2hpY2ggc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiB0byB1c2UgYmFzZWQgb24gZW52aXJvbm1lbnRcbmxldCBzZWxlY3RlZFN0b3JhZ2U7XG5cbi8vIFByb2R1Y3Rpb24gbW9kZSB3aXRoIERBVEFCQVNFX1VSTCAtIHVzZSBQb3N0Z3Jlc1xuaWYgKHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCkge1xuICBjb25zb2xlLmxvZygnVXNpbmcgUG9zdGdyZVNRTCBzdG9yYWdlIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucycpO1xuICBzZWxlY3RlZFN0b3JhZ2UgPSBwZ1N0b3JhZ2U7XG59IFxuLy8gRmFsbGJhY2sgdG8gaW4tbWVtb3J5IHN0b3JhZ2VcbmVsc2Uge1xuICBjb25zb2xlLmxvZygnREFUQUJBU0VfVVJMIG5vdCBmb3VuZCwgdXNpbmcgaW4tbWVtb3J5IHN0b3JhZ2UgKG5vdCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiknKTtcbiAgc2VsZWN0ZWRTdG9yYWdlID0gbmV0bGlmeVN0b3JhZ2U7XG59XG5cbi8qKlxuICogVGhlIHVuaWZpZWQgc3RvcmFnZSBpbnRlcmZhY2UgdGhhdCdzIHVzZWQgYWNyb3NzIGFsbCBBUEkgaGFuZGxlcnNcbiAqIFRoaXMgYWJzdHJhY3RzIGF3YXkgdGhlIGltcGxlbWVudGF0aW9uIGRldGFpbHMgYW5kIHByb3ZpZGVzIGEgY29uc2lzdGVudCBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNvbnN0IHN0b3JhZ2UgPSBzZWxlY3RlZFN0b3JhZ2U7IiwgIi8vIEFQSSBlbmRwb2ludCBmb3IgZGF0YSBtaWdyYXRpb24gb3BlcmF0aW9ucyAobW9zdGx5IGZvciBkZXZlbG9wbWVudCBwdXJwb3NlcylcbmltcG9ydCB7IHN0b3JhZ2UgfSBmcm9tICcuL19zdG9yYWdlJztcbmltcG9ydCB7IHdpdGhFcnJvckhhbmRsZXIgfSBmcm9tICcuL19lcnJvci1oYW5kbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBQT1NUIC0gVHJpZ2dlciBkYXRhIG1pZ3JhdGlvblxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoaXMgaXMgYSBwbGFjZWhvbGRlciBmb3IgbWlncmF0aW9uIGxvZ2ljXG4gICAgICAvLyBJbiBhIHJlYWwgYXBwLCB0aGlzIHdvdWxkIHBlcmZvcm0gZGF0YSBtaWdyYXRpb25zIG9yIHRyYW5zZm9ybWF0aW9uc1xuICAgICAgXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiBcIk1pZ3JhdGlvbiBvcGVyYXRpb24gY29tcGxldGVkIHN1Y2Nlc3NmdWxseVwiLFxuICAgICAgICBkZXRhaWxzOiBcIlRoaXMgZW5kcG9pbnQgaXMgcHJpbWFyaWx5IGZvciBkZXZlbG9wbWVudCBwdXJwb3Nlc1wiXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBkdXJpbmcgbWlncmF0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBNZXRob2Qgbm90IGFsbG93ZWRcbiAgcmVzLnNldEhlYWRlcignQWxsb3cnLCBbJ1BPU1QnXSk7XG4gIHJlcy5zdGF0dXMoNDA1KS5qc29uKHsgZXJyb3I6IHRydWUsIG1lc3NhZ2U6IGBNZXRob2QgJHtyZXEubWV0aG9kfSBOb3QgQWxsb3dlZGAgfSk7XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUNBLFNBQVMsZUFBZTs7O0FDdUJ4QixJQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixJQUFNLFlBQVksb0JBQUksSUFBSTtBQUMxQixJQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixJQUFNLFVBQVUsb0JBQUksSUFBSTtBQUd4QixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGdCQUFnQjtBQUdwQixJQUFNLHlCQUF5QjtBQUMvQixJQUFJLGVBQWU7QUFHWixJQUFNLDBCQUEwQixNQUFNO0FBRTNDLE1BQUksU0FBUyxTQUFTLEtB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R0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLE1BQU0sU0FBUyxVQUFVLElBQUksTUFBTSxlQUFlLENBQUM7QUFDbkY7OztBSmxCQSxJQUFNLG1CQUFtQixPQUFPLEtBQUssWUFBWTtBQUUvQyxRQUFNLFVBQVU7QUFBQSxJQUNkLFFBQVEsSUFBSTtBQUFBLElBQ1osS0FBSyxJQUFJO0FBQUEsSUFDVCxNQUFNLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUFBLElBQ3ZCLE9BQU8sT0FBTyxZQUFZLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxZQUFZO0FBQUEsSUFDdkQsU0FBUyxPQUFPLFlBQVksSUFBSSxPQUFPO0FBQUEsSUFDdkMsTUFBTSxJQUFJLE9BQU8sTUFBTSxJQUFJLEtBQUssSUFBSTtBQUFBLElBQ3BDLFFBQVEsUUFBUSxVQUFVLENBQUM7QUFBQSxFQUM3QjtBQUVBLE1BQUksYUFBYTtBQUNqQixNQUFJLGVBQWUsQ0FBQztBQUNwQixNQUFJLGtCQUFrQixDQUFDO0FBR3ZCLFFBQU0sVUFBVTtBQUFBLElBQ2QsUUFBUSxDQUFDLFNBQVM7QUFDaEIsbUJBQWE7QUFDYixhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsTUFBTSxDQUFDLFNBQVM7QUFDZCxxQkFBZTtBQUNmLHNCQUFnQixjQUFjLElBQUk7QUFDbEMsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLE1BQU0sQ0FBQyxTQUFTO0FBQ2QscUJBQWU7QUFDZixhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsV0FBVyxDQUFDLE1BQU0sVUFBVTtBQUMxQixzQkFBZ0IsSUFBSSxJQUFJO0FBQ3hCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxLQUFLLENBQUMsTUFBTSxVQUFVO0FBQ3BCLHNCQUFnQixJQUFJLElBQUk7QUFDeEIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLEtBQUssTUFBTTtBQUFBLElBQUM7QUFBQSxFQUNkO0FBR0EsUUFBTSxRQUFnQixTQUFTLE9BQU87QUFHdEMsU0FBTyxJQUFJO0FBQUEsSUFDVCxPQUFPLGlCQUFpQixXQUFXLEtBQUssVUFBVSxZQUFZLElBQUk7QUFBQSxJQUNsRTtBQUFBLE1BQ0UsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLGtCQUFRLE9BQU8sS0FBSyxZQUFZO0FBQ3JDLFNBQU8saUJBQWlCLEtBQUssT0FBTztBQUN0QztBQUdPLElBQU0sU0FBUztBQUFBLEVBQ3BCLE1BQU07QUFDUjsiLAogICJuYW1lcyI6IFsiaXNIYWJpdEFjdGl2ZVRvZGF5Il0KfQo=
