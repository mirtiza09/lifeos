
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/habits-id-increment/index.js
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

// netlify/api/habits/[id]/increment.js
async function incrementHabitHandler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
  }
  try {
    const id = validateId(req);
    const habit = await storage.getHabit(id);
    if (!habit) {
      return res.status(404).json({
        error: true,
        message: `Habit with ID ${id} not found`
      });
    }
    if (habit.type !== "counter") {
      return res.status(400).json({
        error: true,
        message: "Only counter-type habits can be incremented."
      });
    }
    if (!habit.isActiveToday) {
      return res.status(400).json({
        error: true,
        message: "This habit is not active today based on its repeat schedule."
      });
    }
    const updatedHabit = await storage.incrementHabit(id);
    return res.status(200).json(updatedHabit);
  } catch (error) {
    throw new Error(`Error incrementing habit: ${error.message}`);
  }
}
var increment_default = withErrorHandler(incrementHabitHandler);

// netlify/functions/habits-id-increment/index.js
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
  await increment_default(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var habits_id_increment_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/habits/:$1/increment.js"
};
export {
  config,
  habits_id_increment_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvaGFiaXRzLWlkLWluY3JlbWVudC9pbmRleC5qcyIsICJuZXRsaWZ5L2FwaS9uZXRsaWZ5LWFkYXB0ZXIuanMiLCAibmV0bGlmeS9hcGkvcGctbmV0bGlmeS1hZGFwdGVyLmpzIiwgIm5ldGxpZnkvYXBpL19zdG9yYWdlLmpzIiwgIm5ldGxpZnkvYXBpL19lcnJvci1oYW5kbGVyLmpzIiwgIm5ldGxpZnkvYXBpL2hhYml0cy9baWRdL2luY3JlbWVudC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciBmb3IgbmVzdGVkIEFQSTogaGFiaXRzL1tpZF0vaW5jcmVtZW50LmpzXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xuLy8gRml4OiBVc2UgYWJzb2x1dGUgcGF0aCByZWZlcmVuY2UgZm9yIHJlbGlhYmxlIGltcG9ydHNcbmltcG9ydCBvcmlnaW5hbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL25ldGxpZnkvYXBpL2hhYml0cy9baWRdL2luY3JlbWVudC5qc1wiO1xuXG4vLyBFeHByZXNzIGFkYXB0ZXIgdG8gY29udmVydCBSZXF1ZXN0L1Jlc3BvbnNlIG9iamVjdHNcbmNvbnN0IGV4cHJlc3NUb05ldGxpZnkgPSBhc3luYyAocmVxLCBjb250ZXh0KSA9PiB7XG4gIC8vIE1vY2sgRXhwcmVzcy1saWtlIG9iamVjdHNcbiAgY29uc3QgbW9ja1JlcSA9IHtcbiAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgdXJsOiByZXEudXJsLFxuICAgIHBhdGg6IG5ldyBVUkwocmVxLnVybCkucGF0aG5hbWUsXG4gICAgcXVlcnk6IE9iamVjdC5mcm9tRW50cmllcyhuZXcgVVJMKHJlcS51cmwpLnNlYXJjaFBhcmFtcyksXG4gICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzKSxcbiAgICBib2R5OiByZXEuYm9keSA/IGF3YWl0IHJlcS5qc29uKCkgOiB1bmRlZmluZWQsXG4gICAgcGFyYW1zOiBjb250ZXh0LnBhcmFtcyB8fCB7fVxuICB9O1xuICBcbiAgbGV0IHN0YXR1c0NvZGUgPSAyMDA7XG4gIGxldCByZXNwb25zZUJvZHkgPSB7fTtcbiAgbGV0IHJlc3BvbnNlSGVhZGVycyA9IHt9O1xuICBcbiAgLy8gTW9jayBFeHByZXNzIHJlc3BvbnNlXG4gIGNvbnN0IG1vY2tSZXMgPSB7XG4gICAgc3RhdHVzOiAoY29kZSkgPT4ge1xuICAgICAgc3RhdHVzQ29kZSA9IGNvZGU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGpzb246IChib2R5KSA9PiB7XG4gICAgICByZXNwb25zZUJvZHkgPSBib2R5O1xuICAgICAgcmVzcG9uc2VIZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2VuZDogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIHNldEhlYWRlcjogKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICByZXNwb25zZUhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0OiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBlbmQ6ICgpID0+IHt9XG4gIH07XG4gIFxuICAvLyBDYWxsIHRoZSBvcmlnaW5hbCBFeHByZXNzIGhhbmRsZXJcbiAgYXdhaXQgb3JpZ2luYWxIYW5kbGVyKG1vY2tSZXEsIG1vY2tSZXMpO1xuICBcbiAgLy8gQ29udmVydCB0byBOZXRsaWZ5IFJlc3BvbnNlXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgdHlwZW9mIHJlc3BvbnNlQm9keSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShyZXNwb25zZUJvZHkpIDogcmVzcG9uc2VCb2R5LFxuICAgIHtcbiAgICAgIHN0YXR1czogc3RhdHVzQ29kZSxcbiAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVyc1xuICAgIH1cbiAgKTtcbn07XG5cbi8vIE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9uIGhhbmRsZXJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgcmV0dXJuIGV4cHJlc3NUb05ldGxpZnkocmVxLCBjb250ZXh0KTtcbn07XG5cbi8vIENvbmZpZ3VyZSByb3V0aW5nXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBwYXRoOiBcIi9hcGkvaGFiaXRzLzokMS9pbmNyZW1lbnQuanNcIlxufTtcbiIsICIvKipcbiAqIE5ldGxpZnkgRnVuY3Rpb25zIFN0b3JhZ2UgQWRhcHRlciAoTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb25zIENvbXBhdGlibGUpXG4gKiBcbiAqIEluLW1lbW9yeSBzdG9yYWdlIGltcGxlbWVudGF0aW9uIHNwZWNpZmljYWxseSBvcHRpbWl6ZWQgZm9yIE5ldGxpZnkncyBzZXJ2ZXJsZXNzIGVudmlyb25tZW50LlxuICogVGhpcyBhZGFwdGVyIGlzIGRlc2lnbmVkIHRvIHdvcmsgd2l0aCB0aGUgbW9kZXJuIE5ldGxpZnkgRnVuY3Rpb25zIEFQSSBhbmQgcHJvdmlkZXM6XG4gKiBcbiAqIDEuIFBlcnNpc3RlbnQgaW4tbWVtb3J5IHN0b3JhZ2UgYWNyb3NzIGZ1bmN0aW9uIGludm9jYXRpb25zICh3aXRoaW4gdGhlIHNhbWUgZnVuY3Rpb24gaW5zdGFuY2UpXG4gKiAyLiBDb21wYXRpYmlsaXR5IHdpdGggTmV0bGlmeSdzIHJlYWQtb25seSBmaWxlc3lzdGVtXG4gKiAzLiBBdXRvbWF0aWMgaW5pdGlhbGl6YXRpb24gd2l0aCBkZWZhdWx0IGRhdGFcbiAqIDQuIENvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBzdG9yYWdlIGludGVyZmFjZVxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEluLW1lbW9yeSBzdG9yYWdlIG1hcHNcbmNvbnN0IHRhc2tzTWFwID0gbmV3IE1hcCgpO1xuY29uc3QgaGFiaXRzTWFwID0gbmV3IE1hcCgpO1xuY29uc3Qgbm90ZXNNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCB1c2VyTWFwID0gbmV3IE1hcCgpO1xuXG4vLyBDb3VudGVyIGZvciBnZW5lcmF0aW5nIElEc1xubGV0IHRhc2tDdXJyZW50SWQgPSAxO1xubGV0IGhhYml0Q3VycmVudElkID0gMTtcbmxldCBub3RlQ3VycmVudElkID0gMTtcbmxldCB1c2VyQ3VycmVudElkID0gMTtcblxuLy8gRGF5IHN0YXJ0IHRpbWUgc2V0dGluZ1xuY29uc3QgREVGQVVMVF9EQVlfU1RBUlRfVElNRSA9ICcwNDowMCc7IC8vIDQgQU0gZGVmYXVsdFxubGV0IGRheVN0YXJ0VGltZSA9IERFRkFVTFRfREFZX1NUQVJUX1RJTUU7XG5cbi8vIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlcnZlcmxlc3NTdG9yYWdlID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXplIHdpdGggZGVmYXVsdCBkYXRhXG4gIGlmICh0YXNrc01hcC5zaXplID09PSAwICYmIGhhYml0c01hcC5zaXplID09PSAwICYmIG5vdGVzTWFwLnNpemUgPT09IDApIHtcbiAgICBpbml0aWFsaXplRGVmYXVsdERhdGEoKTtcbiAgfVxuICBcbiAgcmV0dXJuIHtcbiAgICAvLyBVc2VyIG1ldGhvZHNcbiAgICBhc3luYyBnZXRVc2VyKGlkKSB7XG4gICAgICByZXR1cm4gdXNlck1hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICAgICAgLy8gRmluZCB0aGUgdXNlciB3aXRoIHRoZSBnaXZlbiB1c2VybmFtZVxuICAgICAgZm9yIChjb25zdCB1c2VyIG9mIHVzZXJNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKHVzZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gdXNlcm5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVVzZXIodXNlckRhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gdXNlckN1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgdXNlciA9IHsgXG4gICAgICAgIC4uLnVzZXJEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHVzZXJNYXAuc2V0KGlkLCB1c2VyKTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH0sXG4gICAgXG4gICAgLy8gVGFzayBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VGFza3MoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0YXNrc01hcC52YWx1ZXMoKSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAvLyBDb21wbGV0ZWQgdGFza3Mgc2hvdWxkIGFwcGVhciBhZnRlciBub24tY29tcGxldGVkIHRhc2tzXG4gICAgICAgIGlmIChhLmNvbXBsZXRlZCAhPT0gYi5jb21wbGV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gYS5jb21wbGV0ZWQgPyAxIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU29ydCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShiLmNyZWF0ZWRBdCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFRhc2soaWQpIHtcbiAgICAgIHJldHVybiB0YXNrc01hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVUYXNrKHRhc2tEYXRhKSB7XG4gICAgICBjb25zdCBpZCA9IHRhc2tDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IHRhc2sgPSB7IFxuICAgICAgICAuLi50YXNrRGF0YSwgXG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICB0YXNrc01hcC5zZXQoaWQsIHRhc2spO1xuICAgICAgcmV0dXJuIHRhc2s7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVUYXNrKGlkLCB0YXNrRGF0YSkge1xuICAgICAgY29uc3QgdGFzayA9IHRhc2tzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIXRhc2spIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkVGFzayA9IHsgXG4gICAgICAgIC4uLnRhc2ssIFxuICAgICAgICAuLi50YXNrRGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHRhc2tzTWFwLnNldChpZCwgdXBkYXRlZFRhc2spO1xuICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlVGFzayhpZCkge1xuICAgICAgY29uc3QgdGFzayA9IHRhc2tzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIXRhc2spIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgdGFza3NNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gSGFiaXQgbWV0aG9kc1xuICAgIGFzeW5jIGdldEhhYml0cygpIHtcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBoYWJpdHNBcnJheSA9IEFycmF5LmZyb20oaGFiaXRzTWFwLnZhbHVlcygpKTtcbiAgICAgIFxuICAgICAgLy8gQWRkIGlzQWN0aXZlVG9kYXkgZmllbGQgdG8gZWFjaCBoYWJpdFxuICAgICAgcmV0dXJuIGhhYml0c0FycmF5Lm1hcChoYWJpdCA9PiAoe1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfSkpO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVIYWJpdChoYWJpdERhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gaGFiaXRDdXJyZW50SWQrKztcbiAgICAgIGNvbnN0IGhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXREYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLCAvLyAncGVuZGluZycsICdjb21wbGV0ZWQnLCAnZmFpbGVkJ1xuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIGhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlSGFiaXQoaWQsIGhhYml0RGF0YSkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIC4uLmhhYml0RGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY29tcGxldGVIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZhaWxIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHJlc2V0SGFiaXRTdGF0dXMoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgaW5jcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHR5cGVvZiBoYWJpdC5jdXJyZW50VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQuY3VycmVudFZhbHVlIDogMDtcbiAgICAgIGNvbnN0IG1heFZhbHVlID0gdHlwZW9mIGhhYml0Lm1heFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0Lm1heFZhbHVlIDogSW5maW5pdHk7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWluKGN1cnJlbnRWYWx1ZSArIDEsIG1heFZhbHVlKTtcbiAgICAgIFxuICAgICAgY29uc3Qgc3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBjdXJyZW50VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0eXBlb2YgaGFiaXQuY3VycmVudFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0LmN1cnJlbnRWYWx1ZSA6IDA7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWF4KGN1cnJlbnRWYWx1ZSAtIDEsIDApO1xuICAgICAgXG4gICAgICBjb25zdCBtYXhWYWx1ZSA9IHR5cGVvZiBoYWJpdC5tYXhWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5tYXhWYWx1ZSA6IEluZmluaXR5O1xuICAgICAgY29uc3Qgc3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZEhhYml0ID0geyBcbiAgICAgICAgLi4uaGFiaXQsIFxuICAgICAgICBjdXJyZW50VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuc2V0KGlkLCB1cGRhdGVkSGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udXBkYXRlZEhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZUhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBoYWJpdHNNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gTm90ZSBtZXRob2RzXG4gICAgYXN5bmMgZ2V0Tm90ZXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShub3Rlc01hcC52YWx1ZXMoKSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAvLyBTb3J0IGJ5IGNyZWF0aW9uIGRhdGUgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIuY3JlYXRlZEF0KSAtIG5ldyBEYXRlKGEuY3JlYXRlZEF0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5Q2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICAgIC8vIEZpbmQgdGhlIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gY2F0ZWdvcnkgKGNhc2UtaW5zZW5zaXRpdmUpXG4gICAgICBmb3IgKGNvbnN0IG5vdGUgb2Ygbm90ZXNNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKG5vdGUuY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSA9PT0gY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiBub3RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZU5vdGUobm90ZURhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gbm90ZUN1cnJlbnRJZCsrO1xuICAgICAgY29uc3Qgbm90ZSA9IHsgXG4gICAgICAgIC4uLm5vdGVEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuc2V0KGlkLCBub3RlKTtcbiAgICAgIHJldHVybiBub3RlO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlTm90ZShpZCwgbm90ZURhdGEpIHtcbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlc01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFub3RlKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgdXBkYXRlZE5vdGUgPSB7IFxuICAgICAgICAuLi5ub3RlLCBcbiAgICAgICAgLi4ubm90ZURhdGEsXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBub3Rlc01hcC5zZXQoaWQsIHVwZGF0ZWROb3RlKTtcbiAgICAgIHJldHVybiB1cGRhdGVkTm90ZTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUlkKGlkKSB7XG4gICAgICByZXR1cm4gbm90ZXNNYXAuZ2V0KGlkKSB8fCBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlTm90ZShpZCkge1xuICAgICAgY29uc3Qgbm90ZSA9IG5vdGVzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIW5vdGUpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgbm90ZXNNYXAuZGVsZXRlKGlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gU2V0dGluZ3NcbiAgICBhc3luYyBnZXREYXlTdGFydFRpbWUoKSB7XG4gICAgICByZXR1cm4gZGF5U3RhcnRUaW1lIHx8IERFRkFVTFRfREFZX1NUQVJUX1RJTUU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBzZXREYXlTdGFydFRpbWUodGltZSkge1xuICAgICAgZGF5U3RhcnRUaW1lID0gdGltZTtcbiAgICAgIHJldHVybiBkYXlTdGFydFRpbWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBEYWlseSBkYXRhIGxvZ2dpbmdcbiAgICBhc3luYyBsb2dEYWlseURhdGEoZGF0ZVN0ciwgcmVzZXRIYWJpdHMgPSB0cnVlKSB7XG4gICAgICBpZiAocmVzZXRIYWJpdHMpIHtcbiAgICAgICAgLy8gUmVzZXQgYWxsIGJvb2xlYW4gaGFiaXRzIHRvIHBlbmRpbmdcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIGhhYml0XSBvZiBoYWJpdHNNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKGhhYml0LnR5cGUgPT09ICdib29sZWFuJyAmJiBoYWJpdC5zdGF0dXMgIT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgaGFiaXRzTWFwLnNldChpZCwge1xuICAgICAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGNvdW50ZXIgaGFiaXRzIHRvIDBcbiAgICAgICAgICBpZiAoaGFiaXQudHlwZSA9PT0gJ2NvdW50ZXInKSB7XG4gICAgICAgICAgICBoYWJpdHNNYXAuc2V0KGlkLCB7XG4gICAgICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgICAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBoYWJpdCBpcyBhY3RpdmUgb24gYSBnaXZlbiBkYXlcbmZ1bmN0aW9uIGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdCkge1xuICBpZiAoIWhhYml0LnJlcGVhdFR5cGUpIHJldHVybiB0cnVlO1xuICBcbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKTsgLy8gMCA9IFN1bmRheSwgMSA9IE1vbmRheSwgZXRjLlxuICBcbiAgaWYgKGhhYml0LnJlcGVhdFR5cGUgPT09ICdkYWlseScpIHtcbiAgICAvLyBGb3IgZGFpbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IGV2ZXJ5IGRheSBvciBvbmx5IG9uIHNwZWNpZmljIGRheXNcbiAgICBpZiAoaGFiaXQucmVwZWF0RGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gaGFiaXQucmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRUeXBlID09PSAnd2Vla2x5Jykge1xuICAgIC8vIEZvciB3ZWVrbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IG9uIHRoaXMgZGF5IG9mIHRoZSB3ZWVrXG4gICAgaWYgKGhhYml0LnJlcGVhdERheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIGhhYml0LnJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gSW5pdGlhbGl6ZSB3aXRoIHNvbWUgZXhhbXBsZSBkYXRhXG5mdW5jdGlvbiBpbml0aWFsaXplRGVmYXVsdERhdGEoKSB7XG4gIC8vIENyZWF0ZSBzb21lIGRlZmF1bHQgaGFiaXRzXG4gIGNvbnN0IGhhYml0MSA9IHtcbiAgICBpZDogaGFiaXRDdXJyZW50SWQrKyxcbiAgICBuYW1lOiAnTW9ybmluZyBFeGVyY2lzZScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIHJlcGVhdFR5cGU6ICdkYWlseScsXG4gICAgcmVwZWF0RGF5czogJyonLFxuICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBoYWJpdDIgPSB7XG4gICAgaWQ6IGhhYml0Q3VycmVudElkKyssXG4gICAgbmFtZTogJ0RyaW5rIHdhdGVyJyxcbiAgICB0eXBlOiAnY291bnRlcicsXG4gICAgbWF4VmFsdWU6IDgsXG4gICAgY3VycmVudFZhbHVlOiAwLFxuICAgIHJlcGVhdFR5cGU6ICdkYWlseScsXG4gICAgcmVwZWF0RGF5czogJyonLFxuICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBoYWJpdHNNYXAuc2V0KGhhYml0MS5pZCwgaGFiaXQxKTtcbiAgaGFiaXRzTWFwLnNldChoYWJpdDIuaWQsIGhhYml0Mik7XG4gIFxuICAvLyBDcmVhdGUgZGVmYXVsdCB0YXNrXG4gIGNvbnN0IHRhc2sgPSB7XG4gICAgaWQ6IHRhc2tDdXJyZW50SWQrKyxcbiAgICB0ZXh0OiAnQ3JlYXRlIHByb2plY3QgcGxhbicsXG4gICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgdGFza3NNYXAuc2V0KHRhc2suaWQsIHRhc2spO1xuICBcbiAgLy8gQ3JlYXRlIGRlZmF1bHQgbm90ZXNcbiAgY29uc3Qgbm90ZTEgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0hlYWx0aCcsXG4gICAgY29udGVudDogJyMgSGVhbHRoIEdvYWxzXFxuXFxuLSBJbXByb3ZlIHNsZWVwIHNjaGVkdWxlXFxuLSBEcmluayBtb3JlIHdhdGVyXFxuLSBFeGVyY2lzZSAzIHRpbWVzIGEgd2VlaycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGUyID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdDYXJlZXInLFxuICAgIGNvbnRlbnQ6ICcjIENhcmVlciBOb3Rlc1xcblxcbi0gVXBkYXRlIHJlc3VtZVxcbi0gTmV0d29yayB3aXRoIGluZHVzdHJ5IHByb2Zlc3Npb25hbHNcXG4tIExlYXJuIG5ldyBza2lsbHMnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBjb25zdCBub3RlMyA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnRmluYW5jZXMnLFxuICAgIGNvbnRlbnQ6ICcjIEZpbmFuY2lhbCBHb2Fsc1xcblxcbi0gU2F2ZSAyMCUgb2YgaW5jb21lXFxuLSBSZXZpZXcgYnVkZ2V0IG1vbnRobHlcXG4tIFJlc2VhcmNoIGludmVzdG1lbnQgb3B0aW9ucycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGU0ID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdQZXJzb25hbCcsXG4gICAgY29udGVudDogJyMgUGVyc29uYWwgRGV2ZWxvcG1lbnRcXG5cXG4tIFJlYWQgb25lIGJvb2sgcGVyIG1vbnRoXFxuLSBQcmFjdGljZSBtZWRpdGF0aW9uXFxuLSBTcGVuZCBxdWFsaXR5IHRpbWUgd2l0aCBmYW1pbHknLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICBub3Rlc01hcC5zZXQobm90ZTEuaWQsIG5vdGUxKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGUyLmlkLCBub3RlMik7XG4gIG5vdGVzTWFwLnNldChub3RlMy5pZCwgbm90ZTMpO1xuICBub3Rlc01hcC5zZXQobm90ZTQuaWQsIG5vdGU0KTtcbn1cblxuLy8gRXhwb3J0IHRoZSBuZXRsaWZ5IHN0b3JhZ2Ugc2luZ2xldG9uXG5leHBvcnQgY29uc3QgbmV0bGlmeVN0b3JhZ2UgPSBjcmVhdGVTZXJ2ZXJsZXNzU3RvcmFnZSgpOyIsICIvKipcbiAqIFBvc3RncmVTUUwgQWRhcHRlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnNcbiAqIFxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgYSBQb3N0Z3JlU1FMLWJhc2VkIGltcGxlbWVudGF0aW9uIG9mIHRoZSBzdG9yYWdlIGludGVyZmFjZVxuICogZm9yIE5ldGxpZnkgRnVuY3Rpb25zLiBJdCBjb25uZWN0cyBkaXJlY3RseSB0byB0aGUgUG9zdGdyZVNRTCBkYXRhYmFzZSB1c2luZ1xuICogdGhlIERBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbXBvcnQgdGhlIHBnIG1vZHVsZVxuaW1wb3J0IHBrZyBmcm9tICdwZyc7XG5jb25zdCB7IFBvb2wgfSA9IHBrZztcblxuLy8gQ3JlYXRlIGEgY29ubmVjdGlvbiBwb29sXG5sZXQgcG9vbDtcblxuLy8gRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBQb3N0Z3JlU1FMLWJhc2VkIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjcmVhdGVQZ1N0b3JhZ2UgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpemUgcG9vbCBpZiBub3QgYWxyZWFkeSBjcmVhdGVkXG4gIGlmICghcG9vbCkge1xuICAgIGNvbnN0IGRhdGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMO1xuICAgIFxuICAgIGlmICghZGF0YWJhc2VVcmwpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbWlzc2luZycpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEQVRBQkFTRV9VUkwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgSW5pdGlhbGl6aW5nIFBvc3RncmVTUUwgY29ubmVjdGlvbiAoVVJMIGxlbmd0aDogJHtkYXRhYmFzZVVybC5sZW5ndGh9KWApO1xuICAgIFxuICAgIHBvb2wgPSBuZXcgUG9vbCh7XG4gICAgICBjb25uZWN0aW9uU3RyaW5nOiBkYXRhYmFzZVVybCxcbiAgICAgIC8vIEVuYWJsZSBTU0wgd2l0aCByZWplY3RVbmF1dGhvcml6ZWQgc2V0IHRvIGZhbHNlIGZvciBOZXRsaWZ5XG4gICAgICBzc2w6IHtcbiAgICAgICAgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGVzdCB0aGUgY29ubmVjdGlvblxuICAgIHBvb2wucXVlcnkoJ1NFTEVDVCBOT1coKScpXG4gICAgICAudGhlbigoKSA9PiBjb25zb2xlLmxvZygnUG9zdGdyZVNRTCBkYXRhYmFzZSBjb25uZWN0aW9uIHN1Y2Nlc3NmdWwnKSlcbiAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQb3N0Z3JlU1FMIGNvbm5lY3Rpb24gZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTdGFjayB0cmFjZTonLCBlcnIuc3RhY2spO1xuICAgICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIFVzZXIgbWV0aG9kc1xuICAgIGFzeW5jIGdldFVzZXIoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFVzZXI6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIHVzZXJuYW1lID0gJDEnLFxuICAgICAgICAgIFt1c2VybmFtZV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRVc2VyQnlVc2VybmFtZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVXNlcih1c2VyRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gdXNlcnMgKHVzZXJuYW1lLCBwYXNzd29yZCkgVkFMVUVTICgkMSwgJDIpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbdXNlckRhdGEudXNlcm5hbWUsIHVzZXJEYXRhLnBhc3N3b3JkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVVc2VyOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBUYXNrIG1ldGhvZHNcbiAgICBhc3luYyBnZXRUYXNrcygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gdGFza3MgT1JERVIgQlkgY29tcGxldGVkIEFTQywgY3JlYXRlZF9hdCBERVNDJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93cztcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFRhc2tzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRUYXNrKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIHRhc2tzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVUYXNrKHRhc2tEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgdGFzayB3aXRoIGRhdGE6JywgSlNPTi5zdHJpbmdpZnkodGFza0RhdGEpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEV4dHJhY3QgdGFzayBwcm9wZXJ0aWVzIHdpdGggZGVmYXVsdHNcbiAgICAgICAgY29uc3QgdGV4dCA9IHRhc2tEYXRhLnRleHQ7XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IHRhc2tEYXRhLmNvbXBsZXRlZCB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gdGFza0RhdGEuY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGFza0RhdGEudXNlcklkIHx8IG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyB0YXNrcyAodGV4dCwgY29tcGxldGVkLCBjcmVhdGVkX2F0LCB1c2VyX2lkKSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0KSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW3RleHQsIGNvbXBsZXRlZCwgY3JlYXRlZEF0LCB1c2VySWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZXRhaWxzOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTdGFjayB0cmFjZTonLCBlcnJvci5zdGFjayk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgdXBkYXRlVGFzayhpZCwgdGFza0RhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAoJ3RleHQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGB0ZXh0ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NvbXBsZXRlZCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNvbXBsZXRlZCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS5jb21wbGV0ZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ2NyZWF0ZWRBdCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNyZWF0ZWRfYXQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCd1c2VySWQnIGluIHRhc2tEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGB1c2VyX2lkID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLnVzZXJJZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgdGFza3NcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZVRhc2soaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIHRhc2tzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVUYXNrOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBIYWJpdCBtZXRob2RzXG4gICAgYXN5bmMgZ2V0SGFiaXRzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSBoYWJpdHMnKTtcbiAgICAgICAgY29uc3QgaGFiaXRzID0gcmVzdWx0LnJvd3M7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgaXNBY3RpdmVUb2RheSBmaWVsZCB0byBlYWNoIGhhYml0XG4gICAgICAgIHJldHVybiBoYWJpdHMubWFwKGhhYml0ID0+ICh7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9KSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRIYWJpdHM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZUhhYml0KGhhYml0RGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ29udmVydCBhcnJheSB0byBzdHJpbmcgZm9yIGRhdGFiYXNlIHN0b3JhZ2UgaWYgbmVlZGVkXG4gICAgICAgIGxldCByZXBlYXREYXlzID0gaGFiaXREYXRhLnJlcGVhdERheXM7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlcGVhdERheXMpKSB7XG4gICAgICAgICAgcmVwZWF0RGF5cyA9IHJlcGVhdERheXMuam9pbignLCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgIGBJTlNFUlQgSU5UTyBoYWJpdHMgKFxuICAgICAgICAgICAgbmFtZSwgdHlwZSwgdmFsdWUsIG1heF92YWx1ZSwgc3RhdHVzLCByZXBlYXRfdHlwZSwgcmVwZWF0X2RheXMsIHVzZXJfaWQsIGxhc3RfcmVzZXRcbiAgICAgICAgICApIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4LCAkOSkgUkVUVVJOSU5HICpgLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGhhYml0RGF0YS5uYW1lLFxuICAgICAgICAgICAgaGFiaXREYXRhLnR5cGUgfHwgJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgaGFiaXREYXRhLnZhbHVlIHx8IDAsXG4gICAgICAgICAgICBoYWJpdERhdGEubWF4VmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5zdGF0dXMgfHwgJ3BlbmRpbmcnLFxuICAgICAgICAgICAgaGFiaXREYXRhLnJlcGVhdFR5cGUgfHwgJ2RhaWx5JyxcbiAgICAgICAgICAgIHJlcGVhdERheXMgfHwgJyonLFxuICAgICAgICAgICAgaGFiaXREYXRhLnVzZXJJZCB8fCBudWxsLFxuICAgICAgICAgICAgaGFiaXREYXRhLmxhc3RSZXNldCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICBdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVIYWJpdChpZCwgaGFiaXREYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIHJlcGVhdERheXMgc3BlY2lhbGx5IC0gY29udmVydCBhcnJheSB0byBzdHJpbmdcbiAgICAgICAgaWYgKCdyZXBlYXREYXlzJyBpbiBoYWJpdERhdGEpIHtcbiAgICAgICAgICBsZXQgcmVwZWF0RGF5cyA9IGhhYml0RGF0YS5yZXBlYXREYXlzO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlcGVhdERheXMpKSB7XG4gICAgICAgICAgICByZXBlYXREYXlzID0gcmVwZWF0RGF5cy5qb2luKCcsJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwZGF0ZXMucHVzaChgcmVwZWF0X2RheXMgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gocmVwZWF0RGF5cyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IHtcbiAgICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgICAgdHlwZTogJ3R5cGUnLFxuICAgICAgICAgIHZhbHVlOiAndmFsdWUnLFxuICAgICAgICAgIG1heFZhbHVlOiAnbWF4X3ZhbHVlJyxcbiAgICAgICAgICBzdGF0dXM6ICdzdGF0dXMnLFxuICAgICAgICAgIHJlcGVhdFR5cGU6ICdyZXBlYXRfdHlwZScsXG4gICAgICAgICAgdXNlcklkOiAndXNlcl9pZCcsXG4gICAgICAgICAgbGFzdFJlc2V0OiAnbGFzdF9yZXNldCdcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBhbGwgdGhlIG90aGVyIGZpZWxkc1xuICAgICAgICBmb3IgKGNvbnN0IFtqc0ZpZWxkLCBkYkZpZWxkXSBvZiBPYmplY3QuZW50cmllcyhmaWVsZHMpKSB7XG4gICAgICAgICAgaWYgKGpzRmllbGQgaW4gaGFiaXREYXRhKSB7XG4gICAgICAgICAgICB1cGRhdGVzLnB1c2goYCR7ZGJGaWVsZH0gPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChoYWJpdERhdGFbanNGaWVsZF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSBoYWJpdHNcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjb21wbGV0ZUhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ2NvbXBsZXRlZCcsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNvbXBsZXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZhaWxIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydmYWlsZWQnLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmYWlsSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHJlc2V0SGFiaXRTdGF0dXMoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsncGVuZGluZycsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHJlc2V0SGFiaXRTdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGluY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBGaXJzdCBnZXQgdGhlIGN1cnJlbnQgaGFiaXQgdG8gY2hlY2sgdGhlIHR5cGUgYW5kIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgICAgICBjb25zdCBoYWJpdFJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRSZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gaGFiaXQudmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWF4VmFsdWUgPSBoYWJpdC5tYXhfdmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1pbihjdXJyZW50VmFsdWUgKyAxLCBtYXhWYWx1ZSk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9ICQxLCBzdGF0dXMgPSAkMiBXSEVSRSBpZCA9ICQzIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbbmV3VmFsdWUsIG5ld1N0YXR1cywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCF1cGRhdGVkSGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGluY3JlbWVudEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gRmlyc3QgZ2V0IHRoZSBjdXJyZW50IGhhYml0IHRvIGNoZWNrIHRoZSB0eXBlIGFuZCBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFiaXRSZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIGhhYml0cyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IGhhYml0UmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGhhYml0LnZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG1heFZhbHVlID0gaGFiaXQubWF4X3ZhbHVlIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5tYXgoY3VycmVudFZhbHVlIC0gMSwgMCk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IG5ld1ZhbHVlID49IG1heFZhbHVlID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZyc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9ICQxLCBzdGF0dXMgPSAkMiBXSEVSRSBpZCA9ICQzIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbbmV3VmFsdWUsIG5ld1N0YXR1cywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCF1cGRhdGVkSGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlY3JlbWVudEhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVIYWJpdChpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gTm90ZSBtZXRob2RzXG4gICAgYXN5bmMgZ2V0Tm90ZXMoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIG5vdGVzIE9SREVSIEJZIGNyZWF0ZWRfYXQgREVTQycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXROb3RlczonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5Q2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBGZXRjaGluZyBub3RlIGZvciBjYXRlZ29yeTogJHtjYXRlZ29yeX1gKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBub3RlcyBXSEVSRSBMT1dFUihjYXRlZ29yeSkgPSBMT1dFUigkMSknLFxuICAgICAgICAgIFtjYXRlZ29yeV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBnZXROb3RlQnlDYXRlZ29yeSBmb3IgJHtjYXRlZ29yeX06YCwgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldE5vdGVCeUlkKGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIG5vdGVzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdIHx8IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXROb3RlQnlJZDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlTm90ZShub3RlRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgbm90ZSB3aXRoIHRoaXMgY2F0ZWdvcnkgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgY29uc3QgZXhpc3RpbmdOb3RlID0gYXdhaXQgdGhpcy5nZXROb3RlQnlDYXRlZ29yeShub3RlRGF0YS5jYXRlZ29yeSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZXhpc3RpbmdOb3RlKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIG5vdGVcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy51cGRhdGVOb3RlKGV4aXN0aW5nTm90ZS5pZCwge1xuICAgICAgICAgICAgY29udGVudDogbm90ZURhdGEuY29udGVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgbmV3IG5vdGUgaWYgbm9uZSBleGlzdHNcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnSU5TRVJUIElOVE8gbm90ZXMgKGNhdGVnb3J5LCBjb250ZW50LCBjcmVhdGVkX2F0KSBWQUxVRVMgKCQxLCAkMiwgJDMpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBub3RlRGF0YS5jYXRlZ29yeSxcbiAgICAgICAgICAgIG5vdGVEYXRhLmNvbnRlbnQsXG4gICAgICAgICAgICBub3RlRGF0YS5jcmVhdGVkQXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVOb3RlKGlkLCBub3RlRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmICgnY2F0ZWdvcnknIGluIG5vdGVEYXRhKSB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGBjYXRlZ29yeSA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChub3RlRGF0YS5jYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY29udGVudCcgaW4gbm90ZURhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNvbnRlbnQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2gobm90ZURhdGEuY29udGVudCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1cGRhdGUsIHJldHVybiBudWxsXG4gICAgICAgIGlmICh1cGRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIElEIGFzIHRoZSBsYXN0IHBhcmFtZXRlclxuICAgICAgICB2YWx1ZXMucHVzaChpZCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgbm90ZXNcbiAgICAgICAgICBTRVQgJHt1cGRhdGVzLmpvaW4oJywgJyl9XG4gICAgICAgICAgV0hFUkUgaWQgPSAkJHt2YWx1ZXMubGVuZ3RofVxuICAgICAgICAgIFJFVFVSTklORyAqXG4gICAgICAgIGA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KHF1ZXJ5LCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVwZGF0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZU5vdGUoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0RFTEVURSBGUk9NIG5vdGVzIFdIRVJFIGlkID0gJDEgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA+IDA7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGVOb3RlOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBEYWlseSBkYXRhIGxvZ2dpbmdcbiAgICBhc3luYyBsb2dEYWlseURhdGEoZGF0ZVN0ciwgcmVzZXRIYWJpdHMgPSB0cnVlKSB7XG4gICAgICBpZiAocmVzZXRIYWJpdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBSZXNldCBhbGwgYm9vbGVhbiBoYWJpdHMgdG8gcGVuZGluZ1xuICAgICAgICAgIGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgICBcIlVQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICdwZW5kaW5nJyBXSEVSRSB0eXBlID0gJ2Jvb2xlYW4nXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlc2V0IGFsbCBjb3VudGVyIGhhYml0cyB0byAwXG4gICAgICAgICAgYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAgIFwiVVBEQVRFIGhhYml0cyBTRVQgdmFsdWUgPSAwLCBzdGF0dXMgPSAncGVuZGluZycgV0hFUkUgdHlwZSA9ICdjb3VudGVyJ1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBsb2dEYWlseURhdGE6JywgZXJyb3IpO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIFNldHRpbmdzXG4gICAgYXN5bmMgZ2V0RGF5U3RhcnRUaW1lKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0IHRoZSBzZXR0aW5nIGZyb20gYSBzZXR0aW5ncyB0YWJsZSBvciByZXR1cm4gZGVmYXVsdFxuICAgICAgICByZXR1cm4gJzA0OjAwJzsgLy8gRGVmYXVsdCB0byA0IEFNXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXREYXlTdGFydFRpbWU6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gJzA0OjAwJzsgLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgc2V0RGF5U3RhcnRUaW1lKHRpbWUpIHtcbiAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgc2F2ZSB0byBkYXRhYmFzZVxuICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxuICB9O1xufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIGhhYml0IGlzIGFjdGl2ZSB0b2RheVxuZnVuY3Rpb24gaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KSB7XG4gIGlmICghaGFiaXQucmVwZWF0X3R5cGUpIHJldHVybiB0cnVlO1xuICBcbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKTsgLy8gMCA9IFN1bmRheSwgMSA9IE1vbmRheSwgZXRjLlxuICBcbiAgaWYgKGhhYml0LnJlcGVhdF90eXBlID09PSAnZGFpbHknKSB7XG4gICAgLy8gRm9yIGRhaWx5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBldmVyeSBkYXkgb3Igb25seSBvbiBzcGVjaWZpYyBkYXlzXG4gICAgaWYgKGhhYml0LnJlcGVhdF9kYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENvbnZlcnQgcmVwZWF0X2RheXMgdG8gYXJyYXkgaWYgaXQncyBhIHN0cmluZ1xuICAgIGNvbnN0IHJlcGVhdERheXMgPSB0eXBlb2YgaGFiaXQucmVwZWF0X2RheXMgPT09ICdzdHJpbmcnIFxuICAgICAgPyBoYWJpdC5yZXBlYXRfZGF5cy5zcGxpdCgnLCcpIFxuICAgICAgOiBoYWJpdC5yZXBlYXRfZGF5cztcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gcmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIGlmIChoYWJpdC5yZXBlYXRfdHlwZSA9PT0gJ3dlZWtseScpIHtcbiAgICAvLyBGb3Igd2Vla2x5IGhhYml0cywgY2hlY2sgaWYgaXQgc2hvdWxkIHJlcGVhdCBvbiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIGlmIChoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDb252ZXJ0IHJlcGVhdF9kYXlzIHRvIGFycmF5IGlmIGl0J3MgYSBzdHJpbmdcbiAgICBjb25zdCByZXBlYXREYXlzID0gdHlwZW9mIGhhYml0LnJlcGVhdF9kYXlzID09PSAnc3RyaW5nJyBcbiAgICAgID8gaGFiaXQucmVwZWF0X2RheXMuc3BsaXQoJywnKSBcbiAgICAgIDogaGFiaXQucmVwZWF0X2RheXM7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdG9kYXkncyBkYXkgaXMgaW5jbHVkZWQgaW4gdGhlIHJlcGVhdCBkYXlzXG4gICAgcmV0dXJuIHJlcGVhdERheXMuaW5jbHVkZXMoZGF5T2ZXZWVrLnRvU3RyaW5nKCkpO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHN0b3JhZ2UgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBwZ1N0b3JhZ2UgPSBjcmVhdGVQZ1N0b3JhZ2UoKTsiLCAiLyoqXG4gKiBTdG9yYWdlIGludGVyZmFjZSBmb3IgQVBJIGhhbmRsZXJzXG4gKiBUaGlzIGZpbGUgc2VydmVzIGFzIHRoZSBjZW50cmFsIGRhdGEgYWNjZXNzIGxheWVyIGZvciB0aGUgQVBJXG4gKiBcbiAqIFRoaXMgZmlsZSB1c2VzIHRoZSBQb3N0Z3JlU1FMIHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gZm9yIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRzXG4gKiBhbmQgZmFsbHMgYmFjayB0byBpbi1tZW1vcnkgc3RvcmFnZSBmb3IgZGV2ZWxvcG1lbnQgaWYgREFUQUJBU0VfVVJMIGlzIG5vdCBzZXQuXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW1wb3J0IGJvdGggc3RvcmFnZSBpbXBsZW1lbnRhdGlvbnNcbmltcG9ydCB7IG5ldGxpZnlTdG9yYWdlIH0gZnJvbSAnLi9uZXRsaWZ5LWFkYXB0ZXInO1xuaW1wb3J0IHsgcGdTdG9yYWdlIH0gZnJvbSAnLi9wZy1uZXRsaWZ5LWFkYXB0ZXInO1xuXG4vLyBEZWNpZGUgd2hpY2ggc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiB0byB1c2UgYmFzZWQgb24gZW52aXJvbm1lbnRcbmxldCBzZWxlY3RlZFN0b3JhZ2U7XG5cbi8vIFByb2R1Y3Rpb24gbW9kZSB3aXRoIERBVEFCQVNFX1VSTCAtIHVzZSBQb3N0Z3Jlc1xuaWYgKHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCkge1xuICBjb25zb2xlLmxvZygnVXNpbmcgUG9zdGdyZVNRTCBzdG9yYWdlIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucycpO1xuICBzZWxlY3RlZFN0b3JhZ2UgPSBwZ1N0b3JhZ2U7XG59IFxuLy8gRmFsbGJhY2sgdG8gaW4tbWVtb3J5IHN0b3JhZ2VcbmVsc2Uge1xuICBjb25zb2xlLmxvZygnREFUQUJBU0VfVVJMIG5vdCBmb3VuZCwgdXNpbmcgaW4tbWVtb3J5IHN0b3JhZ2UgKG5vdCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiknKTtcbiAgc2VsZWN0ZWRTdG9yYWdlID0gbmV0bGlmeVN0b3JhZ2U7XG59XG5cbi8qKlxuICogVGhlIHVuaWZpZWQgc3RvcmFnZSBpbnRlcmZhY2UgdGhhdCdzIHVzZWQgYWNyb3NzIGFsbCBBUEkgaGFuZGxlcnNcbiAqIFRoaXMgYWJzdHJhY3RzIGF3YXkgdGhlIGltcGxlbWVudGF0aW9uIGRldGFpbHMgYW5kIHByb3ZpZGVzIGEgY29uc2lzdGVudCBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNvbnN0IHN0b3JhZ2UgPSBzZWxlY3RlZFN0b3JhZ2U7IiwgIi8qKlxuICogRXJyb3IgSGFuZGxpbmcgVXRpbGl0aWVzIGZvciBOZXRsaWZ5IEZ1bmN0aW9uc1xuICogXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyB1dGlsaXR5IGZ1bmN0aW9ucyBmb3Igc3RhbmRhcmRpemVkIGVycm9yIGhhbmRsaW5nXG4gKiBhY3Jvc3MgYWxsIEFQSSBlbmRwb2ludHMsIG1ha2luZyBpdCBlYXNpZXIgdG8gbWFpbnRhaW4gY29uc2lzdGVudCBlcnJvciByZXNwb25zZXMuXG4gKiBUaGVzZSB1dGlsaXRpZXMgYXJlIGNvbXBhdGlibGUgd2l0aCBib3RoIEV4cHJlc3Mtc3R5bGUgaGFuZGxlcnMgYW5kIG1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9ucy5cbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICogXG4gKiBUaGlzIGFsc28gc2VydmVzIGFzIGEgZGVidWdnaW5nIGVuZHBvaW50IGZvciB0aGUgZXJyb3ItaGFuZGxlciBtb2R1bGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICBjb25zb2xlLmxvZygnRXJyb3IgaGFuZGxlciBtb2R1bGUgYWNjZXNzZWQgZGlyZWN0bHknKTtcbiAgY29uc29sZS5sb2coJ0RBVEFCQVNFX1VSTCBhdmFpbGFibGU6JywgcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMID8gJ1llcyAobGVuZ3RoOiAnICsgcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMLmxlbmd0aCArICcpJyA6ICdObycpO1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRXJyb3JIYW5kbGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgIHRyeSB7XG4gICAgICAvLyBTZXQgSlNPTiBwYXJzaW5nIGZvciBhbGwgcmVxdWVzdHNcbiAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJyAmJiByZXEuYm9keSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlcS5ib2R5ID0ge307XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIENhbGwgdGhlIG9yaWdpbmFsIGhhbmRsZXJcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVyKHJlcSwgcmVzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgQVBJIEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICBcbiAgICAgIC8vIERldGVybWluZSBzdGF0dXMgY29kZSBiYXNlZCBvbiBlcnJvciBtZXNzYWdlXG4gICAgICBsZXQgc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdub3QgZm91bmQnKSkgc3RhdHVzQ29kZSA9IDQwNDtcbiAgICAgIGVsc2UgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ3JlcXVpcmVkJykgfHwgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnSW52YWxpZCcpKSBzdGF0dXNDb2RlID0gNDAwO1xuICAgICAgZWxzZSBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygndW5hdXRob3JpemVkJykgfHwgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnZm9yYmlkZGVuJykpIHN0YXR1c0NvZGUgPSA0MDM7XG4gICAgICBcbiAgICAgIC8vIFJldHVybiBhIHN0YW5kYXJkaXplZCBlcnJvciByZXNwb25zZVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoc3RhdHVzQ29kZSkuanNvbih7XG4gICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHJlcXVpcmVkIGZpZWxkcyBpbiB0aGUgcmVxdWVzdCBib2R5XG4gKiBAcGFyYW0ge09iamVjdH0gcmVxIEV4cHJlc3MgcmVxdWVzdCBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gcmVxdWlyZWRGaWVsZHMgQXJyYXkgb2YgcmVxdWlyZWQgZmllbGQgbmFtZXNcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBhbnkgcmVxdWlyZWQgZmllbGRzIGFyZSBtaXNzaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVJlcXVpcmVkRmllbGRzKHJlcSwgcmVxdWlyZWRGaWVsZHMpIHtcbiAgaWYgKCFyZXEuYm9keSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUmVxdWVzdCBib2R5IGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgXG4gIGNvbnN0IG1pc3NpbmdGaWVsZHMgPSByZXF1aXJlZEZpZWxkcy5maWx0ZXIoZmllbGQgPT4gIXJlcS5ib2R5Lmhhc093blByb3BlcnR5KGZpZWxkKSk7XG4gIFxuICBpZiAobWlzc2luZ0ZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkczogJHttaXNzaW5nRmllbGRzLmpvaW4oJywgJyl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gdmFsaWRhdGUgYW4gSUQgcGFyYW1ldGVyIGZyb20gVVJMXG4gKiBAcGFyYW0ge09iamVjdH0gcmVxIEV4cHJlc3MgcmVxdWVzdCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbU5hbWUgVGhlIG5hbWUgb2YgdGhlIElEIHBhcmFtZXRlciAoZGVmYXVsdHMgdG8gJ2lkJylcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBwYXJzZWQgSURcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSUQgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJZChyZXEsIHBhcmFtTmFtZSA9ICdpZCcpIHtcbiAgY29uc3QgaWQgPSBwYXJzZUludChyZXEucGFyYW1zW3BhcmFtTmFtZV0pO1xuICBcbiAgaWYgKGlzTmFOKGlkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCAke3BhcmFtTmFtZX0gcGFyYW1ldGVyLiBFeHBlY3RlZCBhIG51bWJlci5gKTtcbiAgfVxuICBcbiAgcmV0dXJuIGlkO1xufSIsICIvLyBBUEkgZW5kcG9pbnQgZm9yIGluY3JlbWVudGluZyBhIGNvdW50ZXItdHlwZSBoYWJpdFxuaW1wb3J0IHsgc3RvcmFnZSB9IGZyb20gJy4uLy4uL19zdG9yYWdlJztcbmltcG9ydCB7IHdpdGhFcnJvckhhbmRsZXIsIHZhbGlkYXRlSWQgfSBmcm9tICcuLi8uLi9fZXJyb3ItaGFuZGxlcic7XG5cbmFzeW5jIGZ1bmN0aW9uIGluY3JlbWVudEhhYml0SGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBPbmx5IGFsbG93IFBBVENIIHJlcXVlc3RzIGZvciB0aGlzIGVuZHBvaW50XG4gIGlmIChyZXEubWV0aG9kICE9PSAnUEFUQ0gnKSB7XG4gICAgcmVzLnNldEhlYWRlcignQWxsb3cnLCBbJ1BBVENIJ10pO1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwNSkuanNvbih7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiBgTWV0aG9kICR7cmVxLm1ldGhvZH0gTm90IEFsbG93ZWRgIH0pO1xuICB9XG4gIFxuICB0cnkge1xuICAgIC8vIEdldCB0aGUgaGFiaXQgSUQgZnJvbSB0aGUgVVJMIHBhcmFtZXRlclxuICAgIGNvbnN0IGlkID0gdmFsaWRhdGVJZChyZXEpO1xuICAgIFxuICAgIC8vIEdldCB0aGUgaGFiaXQgdG8gdmVyaWZ5IGl0IGV4aXN0c1xuICAgIGNvbnN0IGhhYml0ID0gYXdhaXQgc3RvcmFnZS5nZXRIYWJpdChpZCk7XG4gICAgXG4gICAgaWYgKCFoYWJpdCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgXG4gICAgICAgIGVycm9yOiB0cnVlLCBcbiAgICAgICAgbWVzc2FnZTogYEhhYml0IHdpdGggSUQgJHtpZH0gbm90IGZvdW5kYCBcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBDaGVjayBpZiB0aGUgaGFiaXQgaXMgb2YgY291bnRlciB0eXBlXG4gICAgaWYgKGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcbiAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6IFwiT25seSBjb3VudGVyLXR5cGUgaGFiaXRzIGNhbiBiZSBpbmNyZW1lbnRlZC5cIlxuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIENoZWNrIGlmIHRoZSBoYWJpdCBpcyBhY3RpdmUgdG9kYXlcbiAgICBpZiAoIWhhYml0LmlzQWN0aXZlVG9kYXkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7XG4gICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiBcIlRoaXMgaGFiaXQgaXMgbm90IGFjdGl2ZSB0b2RheSBiYXNlZCBvbiBpdHMgcmVwZWF0IHNjaGVkdWxlLlwiXG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gSW5jcmVtZW50IHRoZSBoYWJpdFxuICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IGF3YWl0IHN0b3JhZ2UuaW5jcmVtZW50SGFiaXQoaWQpO1xuICAgIFxuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih1cGRhdGVkSGFiaXQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgaW5jcmVtZW50aW5nIGhhYml0OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2l0aEVycm9ySGFuZGxlcihpbmNyZW1lbnRIYWJpdEhhbmRsZXIpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFDQSxTQUFTLGVBQWU7OztBQ3VCeEIsSUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsSUFBTSxZQUFZLG9CQUFJLElBQUk7QUFDMUIsSUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsSUFBTSxVQUFVLG9CQUFJLElBQUk7QUFH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
