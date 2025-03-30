
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/api/netlify-adapter.js
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
var tasksMap, habitsMap, notesMap, userMap, taskCurrentId, habitCurrentId, noteCurrentId, userCurrentId, DEFAULT_DAY_START_TIME, dayStartTime, createServerlessStorage, netlifyStorage;
var init_netlify_adapter = __esm({
  "netlify/api/netlify-adapter.js"() {
    "use strict";
    tasksMap = /* @__PURE__ */ new Map();
    habitsMap = /* @__PURE__ */ new Map();
    notesMap = /* @__PURE__ */ new Map();
    userMap = /* @__PURE__ */ new Map();
    taskCurrentId = 1;
    habitCurrentId = 1;
    noteCurrentId = 1;
    userCurrentId = 1;
    DEFAULT_DAY_START_TIME = "04:00";
    dayStartTime = DEFAULT_DAY_START_TIME;
    createServerlessStorage = () => {
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
    netlifyStorage = createServerlessStorage();
  }
});

// netlify/api/pg-netlify-adapter.js
import pkg from "pg";
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
var Pool, pool, createPgStorage, pgStorage;
var init_pg_netlify_adapter = __esm({
  "netlify/api/pg-netlify-adapter.js"() {
    "use strict";
    ({ Pool } = pkg);
    createPgStorage = () => {
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
    pgStorage = createPgStorage();
  }
});

// netlify/api/_storage.js
var storage_exports = {};
__export(storage_exports, {
  default: () => handler,
  storage: () => storage
});
async function handler(req, res) {
  res.status(200).json({
    message: "This is a utility module and shouldn't be called directly",
    success: true
  });
}
var selectedStorage, storage;
var init_storage = __esm({
  "netlify/api/_storage.js"() {
    "use strict";
    init_netlify_adapter();
    init_pg_netlify_adapter();
    if (process.env.DATABASE_URL) {
      console.log("Using PostgreSQL storage for Netlify Functions");
      selectedStorage = pgStorage;
    } else {
      console.log("DATABASE_URL not found, using in-memory storage (not recommended for production)");
      selectedStorage = netlifyStorage;
    }
    storage = selectedStorage;
  }
});

// netlify/functions/diagnostic/index.js
import { Context } from "@netlify/functions";

// netlify/api/diagnostic.js
async function handler2(req, res) {
  try {
    const environment = {
      nodeVersion: process.version,
      netlifyDev: process.env.NETLIFY_DEV === "true",
      context: process.env.CONTEXT || "unknown",
      netlifyLocal: process.env.NETLIFY_LOCAL === "true",
      databaseUrl: process.env.DATABASE_URL ? `Present (length: ${process.env.DATABASE_URL.length})` : "Not set",
      env: Object.keys(process.env).filter((key) => !key.includes("SECRET") && !key.includes("KEY") && !key.includes("TOKEN") && !key.includes("PASSWORD"))
    };
    let storageStatus = "Unknown";
    let pgStatus = "Not tested";
    let importErrors = [];
    try {
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      storageStatus = storage2 ? `Storage object exists (type: ${typeof storage2})` : "Storage object missing";
      try {
        const pg = await import("pg");
        pgStatus = pg ? "pg module imported successfully" : "pg module import returned undefined";
      } catch (pgError) {
        pgStatus = `Error importing pg: ${pgError.message}`;
        importErrors.push({ module: "pg", error: pgError.message });
      }
    } catch (storageError) {
      storageStatus = `Error importing storage: ${storageError.message}`;
      importErrors.push({ module: "storage", error: storageError.message });
    }
    let fileAccess = {
      status: "Not checked"
    };
    try {
      const fs = await import("fs");
      const path = await import("path");
      const currentFile = new URL(import.meta.url).pathname;
      const currentDir = path.dirname(currentFile);
      const files = fs.readdirSync(currentDir);
      fileAccess = {
        status: "Success",
        currentFile,
        currentDir,
        files
      };
    } catch (fsError) {
      fileAccess = {
        status: "Error",
        message: fsError.message
      };
    }
    return res.status(200).json({
      success: true,
      message: "Diagnostic information gathered successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestPath: req.url,
      requestMethod: req.method,
      environment,
      storage: {
        status: storageStatus,
        pgStatus
      },
      fileAccess,
      importErrors: importErrors.length > 0 ? importErrors : null,
      requestHeaders: Object.fromEntries(
        Object.entries(req.headers || {}).filter(([key]) => !key.includes("authorization") && !key.includes("cookie"))
      )
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return res.status(500).json({
      success: false,
      message: "Error gathering diagnostic information",
      error: error.message,
      stack: error.stack
    });
  }
}

// netlify/functions/diagnostic/index.js
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
  await handler2(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var diagnostic_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/diagnostic"
};
export {
  config,
  diagnostic_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9hcGkvbmV0bGlmeS1hZGFwdGVyLmpzIiwgIm5ldGxpZnkvYXBpL3BnLW5ldGxpZnktYWRhcHRlci5qcyIsICJuZXRsaWZ5L2FwaS9fc3RvcmFnZS5qcyIsICJuZXRsaWZ5L2Z1bmN0aW9ucy9kaWFnbm9zdGljL2luZGV4LmpzIiwgIm5ldGxpZnkvYXBpL2RpYWdub3N0aWMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTmV0bGlmeSBGdW5jdGlvbnMgU3RvcmFnZSBBZGFwdGVyIChNb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbnMgQ29tcGF0aWJsZSlcbiAqIFxuICogSW4tbWVtb3J5IHN0b3JhZ2UgaW1wbGVtZW50YXRpb24gc3BlY2lmaWNhbGx5IG9wdGltaXplZCBmb3IgTmV0bGlmeSdzIHNlcnZlcmxlc3MgZW52aXJvbm1lbnQuXG4gKiBUaGlzIGFkYXB0ZXIgaXMgZGVzaWduZWQgdG8gd29yayB3aXRoIHRoZSBtb2Rlcm4gTmV0bGlmeSBGdW5jdGlvbnMgQVBJIGFuZCBwcm92aWRlczpcbiAqIFxuICogMS4gUGVyc2lzdGVudCBpbi1tZW1vcnkgc3RvcmFnZSBhY3Jvc3MgZnVuY3Rpb24gaW52b2NhdGlvbnMgKHdpdGhpbiB0aGUgc2FtZSBmdW5jdGlvbiBpbnN0YW5jZSlcbiAqIDIuIENvbXBhdGliaWxpdHkgd2l0aCBOZXRsaWZ5J3MgcmVhZC1vbmx5IGZpbGVzeXN0ZW1cbiAqIDMuIEF1dG9tYXRpYyBpbml0aWFsaXphdGlvbiB3aXRoIGRlZmF1bHQgZGF0YVxuICogNC4gQ29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIHN0b3JhZ2UgaW50ZXJmYWNlXG4gKi9cblxuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBoYW5kbGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9ucyBjb21wYXRpYmlsaXR5XG4gKiBUaGlzIGVtcHR5IGhhbmRsZXIgaXMgcmVxdWlyZWQgZm9yIHRoZSBOZXRsaWZ5IEZ1bmN0aW9uIHdyYXBwZXIgdG8gd29yayBjb3JyZWN0bHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgIG1lc3NhZ2U6IFwiVGhpcyBpcyBhIHV0aWxpdHkgbW9kdWxlIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5XCIsXG4gICAgc3VjY2VzczogdHJ1ZVxuICB9KTtcbn1cblxuLy8gSW4tbWVtb3J5IHN0b3JhZ2UgbWFwc1xuY29uc3QgdGFza3NNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCBoYWJpdHNNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCBub3Rlc01hcCA9IG5ldyBNYXAoKTtcbmNvbnN0IHVzZXJNYXAgPSBuZXcgTWFwKCk7XG5cbi8vIENvdW50ZXIgZm9yIGdlbmVyYXRpbmcgSURzXG5sZXQgdGFza0N1cnJlbnRJZCA9IDE7XG5sZXQgaGFiaXRDdXJyZW50SWQgPSAxO1xubGV0IG5vdGVDdXJyZW50SWQgPSAxO1xubGV0IHVzZXJDdXJyZW50SWQgPSAxO1xuXG4vLyBEYXkgc3RhcnQgdGltZSBzZXR0aW5nXG5jb25zdCBERUZBVUxUX0RBWV9TVEFSVF9USU1FID0gJzA0OjAwJzsgLy8gNCBBTSBkZWZhdWx0XG5sZXQgZGF5U3RhcnRUaW1lID0gREVGQVVMVF9EQVlfU1RBUlRfVElNRTtcblxuLy8gRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBzdG9yYWdlIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmVybGVzc1N0b3JhZ2UgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGRhdGFcbiAgaWYgKHRhc2tzTWFwLnNpemUgPT09IDAgJiYgaGFiaXRzTWFwLnNpemUgPT09IDAgJiYgbm90ZXNNYXAuc2l6ZSA9PT0gMCkge1xuICAgIGluaXRpYWxpemVEZWZhdWx0RGF0YSgpO1xuICB9XG4gIFxuICByZXR1cm4ge1xuICAgIC8vIFVzZXIgbWV0aG9kc1xuICAgIGFzeW5jIGdldFVzZXIoaWQpIHtcbiAgICAgIHJldHVybiB1c2VyTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gICAgICAvLyBGaW5kIHRoZSB1c2VyIHdpdGggdGhlIGdpdmVuIHVzZXJuYW1lXG4gICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgdXNlck1hcC52YWx1ZXMoKSkge1xuICAgICAgICBpZiAodXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpID09PSB1c2VybmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlVXNlcih1c2VyRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSB1c2VyQ3VycmVudElkKys7XG4gICAgICBjb25zdCB1c2VyID0geyBcbiAgICAgICAgLi4udXNlckRhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgdXNlck1hcC5zZXQoaWQsIHVzZXIpO1xuICAgICAgcmV0dXJuIHVzZXI7XG4gICAgfSxcbiAgICBcbiAgICAvLyBUYXNrIG1ldGhvZHNcbiAgICBhc3luYyBnZXRUYXNrcygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRhc2tzTWFwLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIENvbXBsZXRlZCB0YXNrcyBzaG91bGQgYXBwZWFyIGFmdGVyIG5vbi1jb21wbGV0ZWQgdGFza3NcbiAgICAgICAgaWYgKGEuY29tcGxldGVkICE9PSBiLmNvbXBsZXRlZCkge1xuICAgICAgICAgIHJldHVybiBhLmNvbXBsZXRlZCA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTb3J0IGJ5IGNyZWF0aW9uIGRhdGUgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIuY3JlYXRlZEF0KSAtIG5ldyBEYXRlKGEuY3JlYXRlZEF0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VGFzayhpZCkge1xuICAgICAgcmV0dXJuIHRhc2tzTWFwLmdldChpZCkgfHwgbnVsbDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVRhc2sodGFza0RhdGEpIHtcbiAgICAgIGNvbnN0IGlkID0gdGFza0N1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgdGFzayA9IHsgXG4gICAgICAgIC4uLnRhc2tEYXRhLCBcbiAgICAgICAgaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHRhc2tzTWFwLnNldChpZCwgdGFzayk7XG4gICAgICByZXR1cm4gdGFzaztcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZVRhc2soaWQsIHRhc2tEYXRhKSB7XG4gICAgICBjb25zdCB0YXNrID0gdGFza3NNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghdGFzaykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRUYXNrID0geyBcbiAgICAgICAgLi4udGFzaywgXG4gICAgICAgIC4uLnRhc2tEYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgdGFza3NNYXAuc2V0KGlkLCB1cGRhdGVkVGFzayk7XG4gICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVUYXNrKGlkKSB7XG4gICAgICBjb25zdCB0YXNrID0gdGFza3NNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghdGFzaykgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICB0YXNrc01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBIYWJpdCBtZXRob2RzXG4gICAgYXN5bmMgZ2V0SGFiaXRzKCkge1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGNvbnN0IGhhYml0c0FycmF5ID0gQXJyYXkuZnJvbShoYWJpdHNNYXAudmFsdWVzKCkpO1xuICAgICAgXG4gICAgICAvLyBBZGQgaXNBY3RpdmVUb2RheSBmaWVsZCB0byBlYWNoIGhhYml0XG4gICAgICByZXR1cm4gaGFiaXRzQXJyYXkubWFwKGhhYml0ID0+ICh7XG4gICAgICAgIC4uLmhhYml0LFxuICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICB9KSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZUhhYml0KGhhYml0RGF0YSkge1xuICAgICAgY29uc3QgaWQgPSBoYWJpdEN1cnJlbnRJZCsrO1xuICAgICAgY29uc3QgaGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdERhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsIC8vICdwZW5kaW5nJywgJ2NvbXBsZXRlZCcsICdmYWlsZWQnXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgaGFiaXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVIYWJpdChpZCwgaGFiaXREYXRhKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgLi4uaGFiaXREYXRhLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjb21wbGV0ZUhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmFpbEhhYml0KGlkKSB7XG4gICAgICBjb25zdCBoYWJpdCA9IGhhYml0c01hcC5nZXQoaWQpO1xuICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHsgXG4gICAgICAgIC4uLmhhYml0LCBcbiAgICAgICAgc3RhdHVzOiAnZmFpbGVkJyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgcmVzZXRIYWJpdFN0YXR1cyhpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgaGFiaXRzTWFwLnNldChpZCwgdXBkYXRlZEhhYml0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KHVwZGF0ZWRIYWJpdClcbiAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBpbmNyZW1lbnRIYWJpdChpZCkge1xuICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdHNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghaGFiaXQgfHwgaGFiaXQudHlwZSAhPT0gJ2NvdW50ZXInKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdHlwZW9mIGhhYml0LmN1cnJlbnRWYWx1ZSA9PT0gJ251bWJlcicgPyBoYWJpdC5jdXJyZW50VmFsdWUgOiAwO1xuICAgICAgY29uc3QgbWF4VmFsdWUgPSB0eXBlb2YgaGFiaXQubWF4VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQubWF4VmFsdWUgOiBJbmZpbml0eTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5taW4oY3VycmVudFZhbHVlICsgMSwgbWF4VmFsdWUpO1xuICAgICAgXG4gICAgICBjb25zdCBzdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVjcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHR5cGVvZiBoYWJpdC5jdXJyZW50VmFsdWUgPT09ICdudW1iZXInID8gaGFiaXQuY3VycmVudFZhbHVlIDogMDtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gTWF0aC5tYXgoY3VycmVudFZhbHVlIC0gMSwgMCk7XG4gICAgICBcbiAgICAgIGNvbnN0IG1heFZhbHVlID0gdHlwZW9mIGhhYml0Lm1heFZhbHVlID09PSAnbnVtYmVyJyA/IGhhYml0Lm1heFZhbHVlIDogSW5maW5pdHk7XG4gICAgICBjb25zdCBzdGF0dXMgPSBuZXdWYWx1ZSA+PSBtYXhWYWx1ZSA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkSGFiaXQgPSB7IFxuICAgICAgICAuLi5oYWJpdCwgXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5zZXQoaWQsIHVwZGF0ZWRIYWJpdCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi51cGRhdGVkSGFiaXQsXG4gICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheSh1cGRhdGVkSGFiaXQpXG4gICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlSGFiaXQoaWQpIHtcbiAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIWhhYml0KSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIGhhYml0c01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBOb3RlIG1ldGhvZHNcbiAgICBhc3luYyBnZXROb3RlcygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKG5vdGVzTWFwLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIFNvcnQgYnkgY3JlYXRpb24gZGF0ZSAobmV3ZXN0IGZpcnN0KVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoYi5jcmVhdGVkQXQpIC0gbmV3IERhdGUoYS5jcmVhdGVkQXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgICAgLy8gRmluZCB0aGUgbm90ZSB3aXRoIHRoZSBnaXZlbiBjYXRlZ29yeSAoY2FzZS1pbnNlbnNpdGl2ZSlcbiAgICAgIGZvciAoY29uc3Qgbm90ZSBvZiBub3Rlc01hcC52YWx1ZXMoKSkge1xuICAgICAgICBpZiAobm90ZS5jYXRlZ29yeS50b0xvd2VyQ2FzZSgpID09PSBjYXRlZ29yeS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIG5vdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlTm90ZShub3RlRGF0YSkge1xuICAgICAgY29uc3QgaWQgPSBub3RlQ3VycmVudElkKys7XG4gICAgICBjb25zdCBub3RlID0geyBcbiAgICAgICAgLi4ubm90ZURhdGEsIFxuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgXG4gICAgICBub3Rlc01hcC5zZXQoaWQsIG5vdGUpO1xuICAgICAgcmV0dXJuIG5vdGU7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVOb3RlKGlkLCBub3RlRGF0YSkge1xuICAgICAgY29uc3Qgbm90ZSA9IG5vdGVzTWFwLmdldChpZCk7XG4gICAgICBpZiAoIW5vdGUpIHJldHVybiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCB1cGRhdGVkTm90ZSA9IHsgXG4gICAgICAgIC4uLm5vdGUsIFxuICAgICAgICAuLi5ub3RlRGF0YSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIG5vdGVzTWFwLnNldChpZCwgdXBkYXRlZE5vdGUpO1xuICAgICAgcmV0dXJuIHVwZGF0ZWROb3RlO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5SWQoaWQpIHtcbiAgICAgIHJldHVybiBub3Rlc01hcC5nZXQoaWQpIHx8IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBkZWxldGVOb3RlKGlkKSB7XG4gICAgICBjb25zdCBub3RlID0gbm90ZXNNYXAuZ2V0KGlkKTtcbiAgICAgIGlmICghbm90ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBub3Rlc01hcC5kZWxldGUoaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvLyBTZXR0aW5nc1xuICAgIGFzeW5jIGdldERheVN0YXJ0VGltZSgpIHtcbiAgICAgIHJldHVybiBkYXlTdGFydFRpbWUgfHwgREVGQVVMVF9EQVlfU1RBUlRfVElNRTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHNldERheVN0YXJ0VGltZSh0aW1lKSB7XG4gICAgICBkYXlTdGFydFRpbWUgPSB0aW1lO1xuICAgICAgcmV0dXJuIGRheVN0YXJ0VGltZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIERhaWx5IGRhdGEgbG9nZ2luZ1xuICAgIGFzeW5jIGxvZ0RhaWx5RGF0YShkYXRlU3RyLCByZXNldEhhYml0cyA9IHRydWUpIHtcbiAgICAgIGlmIChyZXNldEhhYml0cykge1xuICAgICAgICAvLyBSZXNldCBhbGwgYm9vbGVhbiBoYWJpdHMgdG8gcGVuZGluZ1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgaGFiaXRdIG9mIGhhYml0c01hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAoaGFiaXQudHlwZSA9PT0gJ2Jvb2xlYW4nICYmIGhhYml0LnN0YXR1cyAhPT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgICBoYWJpdHNNYXAuc2V0KGlkLCB7XG4gICAgICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZXNldCBhbGwgY291bnRlciBoYWJpdHMgdG8gMFxuICAgICAgICAgIGlmIChoYWJpdC50eXBlID09PSAnY291bnRlcicpIHtcbiAgICAgICAgICAgIGhhYml0c01hcC5zZXQoaWQsIHtcbiAgICAgICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTogMCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIGhhYml0IGlzIGFjdGl2ZSBvbiBhIGdpdmVuIGRheVxuZnVuY3Rpb24gaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KSB7XG4gIGlmICghaGFiaXQucmVwZWF0VHlwZSkgcmV0dXJuIHRydWU7XG4gIFxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGRheU9mV2VlayA9IHRvZGF5LmdldERheSgpOyAvLyAwID0gU3VuZGF5LCAxID0gTW9uZGF5LCBldGMuXG4gIFxuICBpZiAoaGFiaXQucmVwZWF0VHlwZSA9PT0gJ2RhaWx5Jykge1xuICAgIC8vIEZvciBkYWlseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgZXZlcnkgZGF5IG9yIG9ubHkgb24gc3BlY2lmaWMgZGF5c1xuICAgIGlmIChoYWJpdC5yZXBlYXREYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiBoYWJpdC5yZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgaWYgKGhhYml0LnJlcGVhdFR5cGUgPT09ICd3ZWVrbHknKSB7XG4gICAgLy8gRm9yIHdlZWtseSBoYWJpdHMsIGNoZWNrIGlmIGl0IHNob3VsZCByZXBlYXQgb24gdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICBpZiAoaGFiaXQucmVwZWF0RGF5cyA9PT0gJyonKSByZXR1cm4gdHJ1ZTtcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gaGFiaXQucmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBJbml0aWFsaXplIHdpdGggc29tZSBleGFtcGxlIGRhdGFcbmZ1bmN0aW9uIGluaXRpYWxpemVEZWZhdWx0RGF0YSgpIHtcbiAgLy8gQ3JlYXRlIHNvbWUgZGVmYXVsdCBoYWJpdHNcbiAgY29uc3QgaGFiaXQxID0ge1xuICAgIGlkOiBoYWJpdEN1cnJlbnRJZCsrLFxuICAgIG5hbWU6ICdNb3JuaW5nIEV4ZXJjaXNlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgcmVwZWF0VHlwZTogJ2RhaWx5JyxcbiAgICByZXBlYXREYXlzOiAnKicsXG4gICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IGhhYml0MiA9IHtcbiAgICBpZDogaGFiaXRDdXJyZW50SWQrKyxcbiAgICBuYW1lOiAnRHJpbmsgd2F0ZXInLFxuICAgIHR5cGU6ICdjb3VudGVyJyxcbiAgICBtYXhWYWx1ZTogOCxcbiAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgcmVwZWF0VHlwZTogJ2RhaWx5JyxcbiAgICByZXBlYXREYXlzOiAnKicsXG4gICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGhhYml0c01hcC5zZXQoaGFiaXQxLmlkLCBoYWJpdDEpO1xuICBoYWJpdHNNYXAuc2V0KGhhYml0Mi5pZCwgaGFiaXQyKTtcbiAgXG4gIC8vIENyZWF0ZSBkZWZhdWx0IHRhc2tcbiAgY29uc3QgdGFzayA9IHtcbiAgICBpZDogdGFza0N1cnJlbnRJZCsrLFxuICAgIHRleHQ6ICdDcmVhdGUgcHJvamVjdCBwbGFuJyxcbiAgICBjb21wbGV0ZWQ6IGZhbHNlLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIFxuICB0YXNrc01hcC5zZXQodGFzay5pZCwgdGFzayk7XG4gIFxuICAvLyBDcmVhdGUgZGVmYXVsdCBub3Rlc1xuICBjb25zdCBub3RlMSA9IHtcbiAgICBpZDogbm90ZUN1cnJlbnRJZCsrLFxuICAgIGNhdGVnb3J5OiAnSGVhbHRoJyxcbiAgICBjb250ZW50OiAnIyBIZWFsdGggR29hbHNcXG5cXG4tIEltcHJvdmUgc2xlZXAgc2NoZWR1bGVcXG4tIERyaW5rIG1vcmUgd2F0ZXJcXG4tIEV4ZXJjaXNlIDMgdGltZXMgYSB3ZWVrJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTIgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ0NhcmVlcicsXG4gICAgY29udGVudDogJyMgQ2FyZWVyIE5vdGVzXFxuXFxuLSBVcGRhdGUgcmVzdW1lXFxuLSBOZXR3b3JrIHdpdGggaW5kdXN0cnkgcHJvZmVzc2lvbmFsc1xcbi0gTGVhcm4gbmV3IHNraWxscycsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIGNvbnN0IG5vdGUzID0ge1xuICAgIGlkOiBub3RlQ3VycmVudElkKyssXG4gICAgY2F0ZWdvcnk6ICdGaW5hbmNlcycsXG4gICAgY29udGVudDogJyMgRmluYW5jaWFsIEdvYWxzXFxuXFxuLSBTYXZlIDIwJSBvZiBpbmNvbWVcXG4tIFJldmlldyBidWRnZXQgbW9udGhseVxcbi0gUmVzZWFyY2ggaW52ZXN0bWVudCBvcHRpb25zJyxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICB9O1xuICBcbiAgY29uc3Qgbm90ZTQgPSB7XG4gICAgaWQ6IG5vdGVDdXJyZW50SWQrKyxcbiAgICBjYXRlZ29yeTogJ1BlcnNvbmFsJyxcbiAgICBjb250ZW50OiAnIyBQZXJzb25hbCBEZXZlbG9wbWVudFxcblxcbi0gUmVhZCBvbmUgYm9vayBwZXIgbW9udGhcXG4tIFByYWN0aWNlIG1lZGl0YXRpb25cXG4tIFNwZW5kIHF1YWxpdHkgdGltZSB3aXRoIGZhbWlseScsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgXG4gIG5vdGVzTWFwLnNldChub3RlMS5pZCwgbm90ZTEpO1xuICBub3Rlc01hcC5zZXQobm90ZTIuaWQsIG5vdGUyKTtcbiAgbm90ZXNNYXAuc2V0KG5vdGUzLmlkLCBub3RlMyk7XG4gIG5vdGVzTWFwLnNldChub3RlNC5pZCwgbm90ZTQpO1xufVxuXG4vLyBFeHBvcnQgdGhlIG5ldGxpZnkgc3RvcmFnZSBzaW5nbGV0b25cbmV4cG9ydCBjb25zdCBuZXRsaWZ5U3RvcmFnZSA9IGNyZWF0ZVNlcnZlcmxlc3NTdG9yYWdlKCk7IiwgIi8qKlxuICogUG9zdGdyZVNRTCBBZGFwdGVyIGZvciBOZXRsaWZ5IEZ1bmN0aW9uc1xuICogXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBhIFBvc3RncmVTUUwtYmFzZWQgaW1wbGVtZW50YXRpb24gb2YgdGhlIHN0b3JhZ2UgaW50ZXJmYWNlXG4gKiBmb3IgTmV0bGlmeSBGdW5jdGlvbnMuIEl0IGNvbm5lY3RzIGRpcmVjdGx5IHRvIHRoZSBQb3N0Z3JlU1FMIGRhdGFiYXNlIHVzaW5nXG4gKiB0aGUgREFUQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICovXG5cbi8qKlxuICogRGVmYXVsdCBleHBvcnQgaGFuZGxlciBmb3IgTmV0bGlmeSBGdW5jdGlvbnMgY29tcGF0aWJpbGl0eVxuICogVGhpcyBlbXB0eSBoYW5kbGVyIGlzIHJlcXVpcmVkIGZvciB0aGUgTmV0bGlmeSBGdW5jdGlvbiB3cmFwcGVyIHRvIHdvcmsgY29ycmVjdGx5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBcbiAgICBtZXNzYWdlOiBcIlRoaXMgaXMgYSB1dGlsaXR5IG1vZHVsZSBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBkaXJlY3RseVwiLFxuICAgIHN1Y2Nlc3M6IHRydWVcbiAgfSk7XG59XG5cbi8vIEltcG9ydCB0aGUgcGcgbW9kdWxlXG5pbXBvcnQgcGtnIGZyb20gJ3BnJztcbmNvbnN0IHsgUG9vbCB9ID0gcGtnO1xuXG4vLyBDcmVhdGUgYSBjb25uZWN0aW9uIHBvb2xcbmxldCBwb29sO1xuXG4vLyBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFBvc3RncmVTUUwtYmFzZWQgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGNyZWF0ZVBnU3RvcmFnZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGl6ZSBwb29sIGlmIG5vdCBhbHJlYWR5IGNyZWF0ZWRcbiAgaWYgKCFwb29sKSB7XG4gICAgY29uc3QgZGF0YWJhc2VVcmwgPSBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkw7XG4gICAgXG4gICAgaWYgKCFkYXRhYmFzZVVybCkge1xuICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IERBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBtaXNzaW5nJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBJbml0aWFsaXppbmcgUG9zdGdyZVNRTCBjb25uZWN0aW9uIChVUkwgbGVuZ3RoOiAke2RhdGFiYXNlVXJsLmxlbmd0aH0pYCk7XG4gICAgXG4gICAgcG9vbCA9IG5ldyBQb29sKHtcbiAgICAgIGNvbm5lY3Rpb25TdHJpbmc6IGRhdGFiYXNlVXJsLFxuICAgICAgLy8gRW5hYmxlIFNTTCB3aXRoIHJlamVjdFVuYXV0aG9yaXplZCBzZXQgdG8gZmFsc2UgZm9yIE5ldGxpZnlcbiAgICAgIHNzbDoge1xuICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUZXN0IHRoZSBjb25uZWN0aW9uXG4gICAgcG9vbC5xdWVyeSgnU0VMRUNUIE5PVygpJylcbiAgICAgIC50aGVuKCgpID0+IGNvbnNvbGUubG9nKCdQb3N0Z3JlU1FMIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bCcpKVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Bvc3RncmVTUUwgY29ubmVjdGlvbiBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N0YWNrIHRyYWNlOicsIGVyci5zdGFjayk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLy8gVXNlciBtZXRob2RzXG4gICAgYXN5bmMgZ2V0VXNlcihpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBpZCA9ICQxJyxcbiAgICAgICAgICBbaWRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VXNlcjonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0VXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgdXNlcm5hbWUgPSAkMScsXG4gICAgICAgICAgW3VzZXJuYW1lXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFVzZXJCeVVzZXJuYW1lOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVVc2VyKHVzZXJEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyB1c2VycyAodXNlcm5hbWUsIHBhc3N3b3JkKSBWQUxVRVMgKCQxLCAkMikgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFt1c2VyRGF0YS51c2VybmFtZSwgdXNlckRhdGEucGFzc3dvcmRdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZVVzZXI6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIFRhc2sgbWV0aG9kc1xuICAgIGFzeW5jIGdldFRhc2tzKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeSgnU0VMRUNUICogRlJPTSB0YXNrcyBPUkRFUiBCWSBjb21wbGV0ZWQgQVNDLCBjcmVhdGVkX2F0IERFU0MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZ2V0VGFza3M6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGdldFRhc2soaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gdGFza3MgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldFRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNyZWF0ZVRhc2sodGFza0RhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyB0YXNrIHdpdGggZGF0YTonLCBKU09OLnN0cmluZ2lmeSh0YXNrRGF0YSkpO1xuICAgICAgICBcbiAgICAgICAgLy8gRXh0cmFjdCB0YXNrIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0c1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGFza0RhdGEudGV4dDtcbiAgICAgICAgY29uc3QgY29tcGxldGVkID0gdGFza0RhdGEuY29tcGxldGVkIHx8IGZhbHNlO1xuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSB0YXNrRGF0YS5jcmVhdGVkQXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zdCB1c2VySWQgPSB0YXNrRGF0YS51c2VySWQgfHwgbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ0lOU0VSVCBJTlRPIHRhc2tzICh0ZXh0LCBjb21wbGV0ZWQsIGNyZWF0ZWRfYXQsIHVzZXJfaWQpIFZBTFVFUyAoJDEsICQyLCAkMywgJDQpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbdGV4dCwgY29tcGxldGVkLCBjcmVhdGVkQXQsIHVzZXJJZF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yb3dzWzBdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRldGFpbHM6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N0YWNrIHRyYWNlOicsIGVycm9yLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB1cGRhdGVUYXNrKGlkLCB0YXNrRGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIFNFVCBwYXJ0IG9mIHRoZSBxdWVyeSBkeW5hbWljYWxseSBiYXNlZCBvbiB3aGF0J3MgcHJvdmlkZWRcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmICgndGV4dCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHRleHQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY29tcGxldGVkJyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY29tcGxldGVkID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKHRhc2tEYXRhLmNvbXBsZXRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgnY3JlYXRlZEF0JyBpbiB0YXNrRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY3JlYXRlZF9hdCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0YXNrRGF0YS5jcmVhdGVkQXQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJ3VzZXJJZCcgaW4gdGFza0RhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYHVzZXJfaWQgPSAkJHt1cGRhdGVzLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2godGFza0RhdGEudXNlcklkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSB0YXNrc1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlVGFzazonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlVGFzayhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gdGFza3MgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZVRhc2s6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIEhhYml0IG1ldGhvZHNcbiAgICBhc3luYyBnZXRIYWJpdHMoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIGhhYml0cycpO1xuICAgICAgICBjb25zdCBoYWJpdHMgPSByZXN1bHQucm93cztcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBpc0FjdGl2ZVRvZGF5IGZpZWxkIHRvIGVhY2ggaGFiaXRcbiAgICAgICAgcmV0dXJuIGhhYml0cy5tYXAoaGFiaXQgPT4gKHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH0pKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldEhhYml0czonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIGlmICghaGFiaXQpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5oYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBnZXRIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgY3JlYXRlSGFiaXQoaGFiaXREYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDb252ZXJ0IGFycmF5IHRvIHN0cmluZyBmb3IgZGF0YWJhc2Ugc3RvcmFnZSBpZiBuZWVkZWRcbiAgICAgICAgbGV0IHJlcGVhdERheXMgPSBoYWJpdERhdGEucmVwZWF0RGF5cztcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVwZWF0RGF5cykpIHtcbiAgICAgICAgICByZXBlYXREYXlzID0gcmVwZWF0RGF5cy5qb2luKCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgYElOU0VSVCBJTlRPIGhhYml0cyAoXG4gICAgICAgICAgICBuYW1lLCB0eXBlLCB2YWx1ZSwgbWF4X3ZhbHVlLCBzdGF0dXMsIHJlcGVhdF90eXBlLCByZXBlYXRfZGF5cywgdXNlcl9pZCwgbGFzdF9yZXNldFxuICAgICAgICAgICkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5KSBSRVRVUk5JTkcgKmAsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgaGFiaXREYXRhLm5hbWUsXG4gICAgICAgICAgICBoYWJpdERhdGEudHlwZSB8fCAnYm9vbGVhbicsXG4gICAgICAgICAgICBoYWJpdERhdGEudmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGhhYml0RGF0YS5tYXhWYWx1ZSB8fCAwLFxuICAgICAgICAgICAgaGFiaXREYXRhLnN0YXR1cyB8fCAncGVuZGluZycsXG4gICAgICAgICAgICBoYWJpdERhdGEucmVwZWF0VHlwZSB8fCAnZGFpbHknLFxuICAgICAgICAgICAgcmVwZWF0RGF5cyB8fCAnKicsXG4gICAgICAgICAgICBoYWJpdERhdGEudXNlcklkIHx8IG51bGwsXG4gICAgICAgICAgICBoYWJpdERhdGEubGFzdFJlc2V0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZUhhYml0KGlkLCBoYWJpdERhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBTRVQgcGFydCBvZiB0aGUgcXVlcnkgZHluYW1pY2FsbHkgYmFzZWQgb24gd2hhdCdzIHByb3ZpZGVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgcmVwZWF0RGF5cyBzcGVjaWFsbHkgLSBjb252ZXJ0IGFycmF5IHRvIHN0cmluZ1xuICAgICAgICBpZiAoJ3JlcGVhdERheXMnIGluIGhhYml0RGF0YSkge1xuICAgICAgICAgIGxldCByZXBlYXREYXlzID0gaGFiaXREYXRhLnJlcGVhdERheXM7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVwZWF0RGF5cykpIHtcbiAgICAgICAgICAgIHJlcGVhdERheXMgPSByZXBlYXREYXlzLmpvaW4oJywnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKGByZXBlYXRfZGF5cyA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChyZXBlYXREYXlzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZmllbGRzID0ge1xuICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICB0eXBlOiAndHlwZScsXG4gICAgICAgICAgdmFsdWU6ICd2YWx1ZScsXG4gICAgICAgICAgbWF4VmFsdWU6ICdtYXhfdmFsdWUnLFxuICAgICAgICAgIHN0YXR1czogJ3N0YXR1cycsXG4gICAgICAgICAgcmVwZWF0VHlwZTogJ3JlcGVhdF90eXBlJyxcbiAgICAgICAgICB1c2VySWQ6ICd1c2VyX2lkJyxcbiAgICAgICAgICBsYXN0UmVzZXQ6ICdsYXN0X3Jlc2V0J1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIGFsbCB0aGUgb3RoZXIgZmllbGRzXG4gICAgICAgIGZvciAoY29uc3QgW2pzRmllbGQsIGRiRmllbGRdIG9mIE9iamVjdC5lbnRyaWVzKGZpZWxkcykpIHtcbiAgICAgICAgICBpZiAoanNGaWVsZCBpbiBoYWJpdERhdGEpIHtcbiAgICAgICAgICAgIHVwZGF0ZXMucHVzaChgJHtkYkZpZWxkfSA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKGhhYml0RGF0YVtqc0ZpZWxkXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGVyZSdzIG5vdGhpbmcgdG8gdXBkYXRlLCByZXR1cm4gbnVsbFxuICAgICAgICBpZiAodXBkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBJRCBhcyB0aGUgbGFzdCBwYXJhbWV0ZXJcbiAgICAgICAgdmFsdWVzLnB1c2goaWQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgVVBEQVRFIGhhYml0c1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGhhYml0ID0gcmVzdWx0LnJvd3NbMF07XG4gICAgICAgIFxuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlSGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGNvbXBsZXRlSGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHN0YXR1cyA9ICQxIFdIRVJFIGlkID0gJDIgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFsnY29tcGxldGVkJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY29tcGxldGVIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmFpbEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdVUERBVEUgaGFiaXRzIFNFVCBzdGF0dXMgPSAkMSBXSEVSRSBpZCA9ICQyIFJFVFVSTklORyAqJyxcbiAgICAgICAgICBbJ2ZhaWxlZCcsIGlkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmhhYml0LFxuICAgICAgICAgIGlzQWN0aXZlVG9kYXk6IGlzSGFiaXRBY3RpdmVUb2RheShoYWJpdClcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGZhaWxIYWJpdDonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgcmVzZXRIYWJpdFN0YXR1cyhpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJDEgV0hFUkUgaWQgPSAkMiBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgWydwZW5kaW5nJywgaWRdXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBoYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uaGFiaXQsXG4gICAgICAgICAgaXNBY3RpdmVUb2RheTogaXNIYWJpdEFjdGl2ZVRvZGF5KGhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gcmVzZXRIYWJpdFN0YXR1czonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgaW5jcmVtZW50SGFiaXQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEZpcnN0IGdldCB0aGUgY3VycmVudCBoYWJpdCB0byBjaGVjayB0aGUgdHlwZSBhbmQgZ2V0IHRoZSBjdXJyZW50IHZhbHVlXG4gICAgICAgIGNvbnN0IGhhYml0UmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnU0VMRUNUICogRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFiaXQgPSBoYWJpdFJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIWhhYml0IHx8IGhhYml0LnR5cGUgIT09ICdjb3VudGVyJykgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBoYWJpdC52YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IGhhYml0Lm1heF92YWx1ZSB8fCAwO1xuICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IE1hdGgubWluKGN1cnJlbnRWYWx1ZSArIDEsIG1heFZhbHVlKTtcbiAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gJDEsIHN0YXR1cyA9ICQyIFdIRVJFIGlkID0gJDMgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtuZXdWYWx1ZSwgbmV3U3RhdHVzLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIXVwZGF0ZWRIYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gaW5jcmVtZW50SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlY3JlbWVudEhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBGaXJzdCBnZXQgdGhlIGN1cnJlbnQgaGFiaXQgdG8gY2hlY2sgdGhlIHR5cGUgYW5kIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgICAgICBjb25zdCBoYWJpdFJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gaGFiaXRzIFdIRVJFIGlkID0gJDEnLFxuICAgICAgICAgIFtpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhYml0ID0gaGFiaXRSZXN1bHQucm93c1swXTtcbiAgICAgICAgaWYgKCFoYWJpdCB8fCBoYWJpdC50eXBlICE9PSAnY291bnRlcicpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gaGFiaXQudmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWF4VmFsdWUgPSBoYWJpdC5tYXhfdmFsdWUgfHwgMDtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLm1heChjdXJyZW50VmFsdWUgLSAxLCAwKTtcbiAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gbmV3VmFsdWUgPj0gbWF4VmFsdWUgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1VQREFURSBoYWJpdHMgU0VUIHZhbHVlID0gJDEsIHN0YXR1cyA9ICQyIFdIRVJFIGlkID0gJDMgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtuZXdWYWx1ZSwgbmV3U3RhdHVzLCBpZF1cbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRIYWJpdCA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICBpZiAoIXVwZGF0ZWRIYWJpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVwZGF0ZWRIYWJpdCxcbiAgICAgICAgICBpc0FjdGl2ZVRvZGF5OiBpc0hhYml0QWN0aXZlVG9kYXkodXBkYXRlZEhhYml0KVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVjcmVtZW50SGFiaXQ6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGRlbGV0ZUhhYml0KGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdERUxFVEUgRlJPTSBoYWJpdHMgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZUhhYml0OicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBOb3RlIG1ldGhvZHNcbiAgICBhc3luYyBnZXROb3RlcygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoJ1NFTEVDVCAqIEZST00gbm90ZXMgT1JERVIgQlkgY3JlYXRlZF9hdCBERVNDJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93cztcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldE5vdGVzOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBnZXROb3RlQnlDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coYEZldGNoaW5nIG5vdGUgZm9yIGNhdGVnb3J5OiAke2NhdGVnb3J5fWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdTRUxFQ1QgKiBGUk9NIG5vdGVzIFdIRVJFIExPV0VSKGNhdGVnb3J5KSA9IExPV0VSKCQxKScsXG4gICAgICAgICAgW2NhdGVnb3J5XVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGdldE5vdGVCeUNhdGVnb3J5IGZvciAke2NhdGVnb3J5fTpgLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZ2V0Tm90ZUJ5SWQoaWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgJ1NFTEVDVCAqIEZST00gbm90ZXMgV0hFUkUgaWQgPSAkMScsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NbMF0gfHwgbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldE5vdGVCeUlkOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBjcmVhdGVOb3RlKG5vdGVEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDaGVjayBpZiBub3RlIHdpdGggdGhpcyBjYXRlZ29yeSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBjb25zdCBleGlzdGluZ05vdGUgPSBhd2FpdCB0aGlzLmdldE5vdGVCeUNhdGVnb3J5KG5vdGVEYXRhLmNhdGVnb3J5KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChleGlzdGluZ05vdGUpIHtcbiAgICAgICAgICAvLyBVcGRhdGUgZXhpc3Rpbmcgbm90ZVxuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZU5vdGUoZXhpc3RpbmdOb3RlLmlkLCB7XG4gICAgICAgICAgICBjb250ZW50OiBub3RlRGF0YS5jb250ZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBuZXcgbm90ZSBpZiBub25lIGV4aXN0c1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICdJTlNFUlQgSU5UTyBub3RlcyAoY2F0ZWdvcnksIGNvbnRlbnQsIGNyZWF0ZWRfYXQpIFZBTFVFUyAoJDEsICQyLCAkMykgUkVUVVJOSU5HIConLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG5vdGVEYXRhLmNhdGVnb3J5LFxuICAgICAgICAgICAgbm90ZURhdGEuY29udGVudCxcbiAgICAgICAgICAgIG5vdGVEYXRhLmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICBdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNyZWF0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIHVwZGF0ZU5vdGUoaWQsIG5vdGVEYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCB0aGUgU0VUIHBhcnQgb2YgdGhlIHF1ZXJ5IGR5bmFtaWNhbGx5IGJhc2VkIG9uIHdoYXQncyBwcm92aWRlZFxuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCdjYXRlZ29yeScgaW4gbm90ZURhdGEpIHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goYGNhdGVnb3J5ID0gJCR7dXBkYXRlcy5sZW5ndGggKyAxfWApO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG5vdGVEYXRhLmNhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCdjb250ZW50JyBpbiBub3RlRGF0YSkge1xuICAgICAgICAgIHVwZGF0ZXMucHVzaChgY29udGVudCA9ICQke3VwZGF0ZXMubGVuZ3RoICsgMX1gKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChub3RlRGF0YS5jb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlcmUncyBub3RoaW5nIHRvIHVwZGF0ZSwgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgYXMgdGhlIGxhc3QgcGFyYW1ldGVyXG4gICAgICAgIHZhbHVlcy5wdXNoKGlkKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gYFxuICAgICAgICAgIFVQREFURSBub3Rlc1xuICAgICAgICAgIFNFVCAke3VwZGF0ZXMuam9pbignLCAnKX1cbiAgICAgICAgICBXSEVSRSBpZCA9ICQke3ZhbHVlcy5sZW5ndGh9XG4gICAgICAgICAgUkVUVVJOSU5HICpcbiAgICAgICAgYDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvb2wucXVlcnkocXVlcnksIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiByZXN1bHQucm93c1swXSB8fCBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdXBkYXRlTm90ZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZGVsZXRlTm90ZShpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAnREVMRVRFIEZST00gbm90ZXMgV0hFUkUgaWQgPSAkMSBSRVRVUk5JTkcgKicsXG4gICAgICAgICAgW2lkXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID4gMDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGRlbGV0ZU5vdGU6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIERhaWx5IGRhdGEgbG9nZ2luZ1xuICAgIGFzeW5jIGxvZ0RhaWx5RGF0YShkYXRlU3RyLCByZXNldEhhYml0cyA9IHRydWUpIHtcbiAgICAgIGlmIChyZXNldEhhYml0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFJlc2V0IGFsbCBib29sZWFuIGhhYml0cyB0byBwZW5kaW5nXG4gICAgICAgICAgYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICAgICAgIFwiVVBEQVRFIGhhYml0cyBTRVQgc3RhdHVzID0gJ3BlbmRpbmcnIFdIRVJFIHR5cGUgPSAnYm9vbGVhbidcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVzZXQgYWxsIGNvdW50ZXIgaGFiaXRzIHRvIDBcbiAgICAgICAgICBhd2FpdCBwb29sLnF1ZXJ5KFxuICAgICAgICAgICAgXCJVUERBVEUgaGFiaXRzIFNFVCB2YWx1ZSA9IDAsIHN0YXR1cyA9ICdwZW5kaW5nJyBXSEVSRSB0eXBlID0gJ2NvdW50ZXInXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGxvZ0RhaWx5RGF0YTonLCBlcnJvcik7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gU2V0dGluZ3NcbiAgICBhc3luYyBnZXREYXlTdGFydFRpbWUoKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBHZXQgdGhlIHNldHRpbmcgZnJvbSBhIHNldHRpbmdzIHRhYmxlIG9yIHJldHVybiBkZWZhdWx0XG4gICAgICAgIHJldHVybiAnMDQ6MDAnOyAvLyBEZWZhdWx0IHRvIDQgQU1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGdldERheVN0YXJ0VGltZTonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiAnMDQ6MDAnOyAvLyBEZWZhdWx0IHZhbHVlXG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBzZXREYXlTdGFydFRpbWUodGltZSkge1xuICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCBzYXZlIHRvIGRhdGFiYXNlXG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgaGFiaXQgaXMgYWN0aXZlIHRvZGF5XG5mdW5jdGlvbiBpc0hhYml0QWN0aXZlVG9kYXkoaGFiaXQpIHtcbiAgaWYgKCFoYWJpdC5yZXBlYXRfdHlwZSkgcmV0dXJuIHRydWU7XG4gIFxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGRheU9mV2VlayA9IHRvZGF5LmdldERheSgpOyAvLyAwID0gU3VuZGF5LCAxID0gTW9uZGF5LCBldGMuXG4gIFxuICBpZiAoaGFiaXQucmVwZWF0X3R5cGUgPT09ICdkYWlseScpIHtcbiAgICAvLyBGb3IgZGFpbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IGV2ZXJ5IGRheSBvciBvbmx5IG9uIHNwZWNpZmljIGRheXNcbiAgICBpZiAoaGFiaXQucmVwZWF0X2RheXMgPT09ICcqJykgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgLy8gQ29udmVydCByZXBlYXRfZGF5cyB0byBhcnJheSBpZiBpdCdzIGEgc3RyaW5nXG4gICAgY29uc3QgcmVwZWF0RGF5cyA9IHR5cGVvZiBoYWJpdC5yZXBlYXRfZGF5cyA9PT0gJ3N0cmluZycgXG4gICAgICA/IGhhYml0LnJlcGVhdF9kYXlzLnNwbGl0KCcsJykgXG4gICAgICA6IGhhYml0LnJlcGVhdF9kYXlzO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRvZGF5J3MgZGF5IGlzIGluY2x1ZGVkIGluIHRoZSByZXBlYXQgZGF5c1xuICAgIHJldHVybiByZXBlYXREYXlzLmluY2x1ZGVzKGRheU9mV2Vlay50b1N0cmluZygpKTtcbiAgfVxuICBcbiAgaWYgKGhhYml0LnJlcGVhdF90eXBlID09PSAnd2Vla2x5Jykge1xuICAgIC8vIEZvciB3ZWVrbHkgaGFiaXRzLCBjaGVjayBpZiBpdCBzaG91bGQgcmVwZWF0IG9uIHRoaXMgZGF5IG9mIHRoZSB3ZWVrXG4gICAgaWYgKGhhYml0LnJlcGVhdF9kYXlzID09PSAnKicpIHJldHVybiB0cnVlO1xuICAgIFxuICAgIC8vIENvbnZlcnQgcmVwZWF0X2RheXMgdG8gYXJyYXkgaWYgaXQncyBhIHN0cmluZ1xuICAgIGNvbnN0IHJlcGVhdERheXMgPSB0eXBlb2YgaGFiaXQucmVwZWF0X2RheXMgPT09ICdzdHJpbmcnIFxuICAgICAgPyBoYWJpdC5yZXBlYXRfZGF5cy5zcGxpdCgnLCcpIFxuICAgICAgOiBoYWJpdC5yZXBlYXRfZGF5cztcbiAgICBcbiAgICAvLyBDaGVjayBpZiB0b2RheSdzIGRheSBpcyBpbmNsdWRlZCBpbiB0aGUgcmVwZWF0IGRheXNcbiAgICByZXR1cm4gcmVwZWF0RGF5cy5pbmNsdWRlcyhkYXlPZldlZWsudG9TdHJpbmcoKSk7XG4gIH1cbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgc3RvcmFnZSBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IHBnU3RvcmFnZSA9IGNyZWF0ZVBnU3RvcmFnZSgpOyIsICIvKipcbiAqIFN0b3JhZ2UgaW50ZXJmYWNlIGZvciBBUEkgaGFuZGxlcnNcbiAqIFRoaXMgZmlsZSBzZXJ2ZXMgYXMgdGhlIGNlbnRyYWwgZGF0YSBhY2Nlc3MgbGF5ZXIgZm9yIHRoZSBBUElcbiAqIFxuICogVGhpcyBmaWxlIHVzZXMgdGhlIFBvc3RncmVTUUwgc3RvcmFnZSBpbXBsZW1lbnRhdGlvbiBmb3IgcHJvZHVjdGlvbiBlbnZpcm9ubWVudHNcbiAqIGFuZCBmYWxscyBiYWNrIHRvIGluLW1lbW9yeSBzdG9yYWdlIGZvciBkZXZlbG9wbWVudCBpZiBEQVRBQkFTRV9VUkwgaXMgbm90IHNldC5cbiAqL1xuXG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGhhbmRsZXIgZm9yIE5ldGxpZnkgRnVuY3Rpb25zIGNvbXBhdGliaWxpdHlcbiAqIFRoaXMgZW1wdHkgaGFuZGxlciBpcyByZXF1aXJlZCBmb3IgdGhlIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciB0byB3b3JrIGNvcnJlY3RseVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGEgdXRpbGl0eSBtb2R1bGUgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgZGlyZWN0bHlcIixcbiAgICBzdWNjZXNzOiB0cnVlXG4gIH0pO1xufVxuXG4vLyBJbXBvcnQgYm90aCBzdG9yYWdlIGltcGxlbWVudGF0aW9uc1xuaW1wb3J0IHsgbmV0bGlmeVN0b3JhZ2UgfSBmcm9tICcuL25ldGxpZnktYWRhcHRlcic7XG5pbXBvcnQgeyBwZ1N0b3JhZ2UgfSBmcm9tICcuL3BnLW5ldGxpZnktYWRhcHRlcic7XG5cbi8vIERlY2lkZSB3aGljaCBzdG9yYWdlIGltcGxlbWVudGF0aW9uIHRvIHVzZSBiYXNlZCBvbiBlbnZpcm9ubWVudFxubGV0IHNlbGVjdGVkU3RvcmFnZTtcblxuLy8gUHJvZHVjdGlvbiBtb2RlIHdpdGggREFUQUJBU0VfVVJMIC0gdXNlIFBvc3RncmVzXG5pZiAocHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gIGNvbnNvbGUubG9nKCdVc2luZyBQb3N0Z3JlU1FMIHN0b3JhZ2UgZm9yIE5ldGxpZnkgRnVuY3Rpb25zJyk7XG4gIHNlbGVjdGVkU3RvcmFnZSA9IHBnU3RvcmFnZTtcbn0gXG4vLyBGYWxsYmFjayB0byBpbi1tZW1vcnkgc3RvcmFnZVxuZWxzZSB7XG4gIGNvbnNvbGUubG9nKCdEQVRBQkFTRV9VUkwgbm90IGZvdW5kLCB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSAobm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uKScpO1xuICBzZWxlY3RlZFN0b3JhZ2UgPSBuZXRsaWZ5U3RvcmFnZTtcbn1cblxuLyoqXG4gKiBUaGUgdW5pZmllZCBzdG9yYWdlIGludGVyZmFjZSB0aGF0J3MgdXNlZCBhY3Jvc3MgYWxsIEFQSSBoYW5kbGVyc1xuICogVGhpcyBhYnN0cmFjdHMgYXdheSB0aGUgaW1wbGVtZW50YXRpb24gZGV0YWlscyBhbmQgcHJvdmlkZXMgYSBjb25zaXN0ZW50IGludGVyZmFjZVxuICovXG5leHBvcnQgY29uc3Qgc3RvcmFnZSA9IHNlbGVjdGVkU3RvcmFnZTsiLCAiLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciBmb3IgZGlhZ25vc3RpYyBBUElcbmltcG9ydCB7IENvbnRleHQgfSBmcm9tIFwiQG5ldGxpZnkvZnVuY3Rpb25zXCI7XG4vLyBGaXg6IFVzZSBhYnNvbHV0ZSBwYXRoIHJlZmVyZW5jZSBmb3IgcmVsaWFibGUgaW1wb3J0c1xuaW1wb3J0IG9yaWdpbmFsSGFuZGxlciBmcm9tIFwiLi4vLi4vLi4vbmV0bGlmeS9hcGkvZGlhZ25vc3RpYy5qc1wiO1xuXG4vLyBFeHByZXNzIGFkYXB0ZXIgdG8gY29udmVydCBSZXF1ZXN0L1Jlc3BvbnNlIG9iamVjdHNcbmNvbnN0IGV4cHJlc3NUb05ldGxpZnkgPSBhc3luYyAocmVxLCBjb250ZXh0KSA9PiB7XG4gIC8vIE1vY2sgRXhwcmVzcy1saWtlIG9iamVjdHNcbiAgY29uc3QgbW9ja1JlcSA9IHtcbiAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgdXJsOiByZXEudXJsLFxuICAgIHBhdGg6IG5ldyBVUkwocmVxLnVybCkucGF0aG5hbWUsXG4gICAgcXVlcnk6IE9iamVjdC5mcm9tRW50cmllcyhuZXcgVVJMKHJlcS51cmwpLnNlYXJjaFBhcmFtcyksXG4gICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzKSxcbiAgICBib2R5OiByZXEuYm9keSA/IGF3YWl0IHJlcS5qc29uKCkgOiB1bmRlZmluZWQsXG4gICAgcGFyYW1zOiBjb250ZXh0LnBhcmFtcyB8fCB7fVxuICB9O1xuICBcbiAgbGV0IHN0YXR1c0NvZGUgPSAyMDA7XG4gIGxldCByZXNwb25zZUJvZHkgPSB7fTtcbiAgbGV0IHJlc3BvbnNlSGVhZGVycyA9IHt9O1xuICBcbiAgLy8gTW9jayBFeHByZXNzIHJlc3BvbnNlXG4gIGNvbnN0IG1vY2tSZXMgPSB7XG4gICAgc3RhdHVzOiAoY29kZSkgPT4ge1xuICAgICAgc3RhdHVzQ29kZSA9IGNvZGU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGpzb246IChib2R5KSA9PiB7XG4gICAgICByZXNwb25zZUJvZHkgPSBib2R5O1xuICAgICAgcmVzcG9uc2VIZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2VuZDogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIHNldEhlYWRlcjogKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICByZXNwb25zZUhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0OiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBlbmQ6ICgpID0+IHt9XG4gIH07XG4gIFxuICAvLyBDYWxsIHRoZSBvcmlnaW5hbCBFeHByZXNzIGhhbmRsZXJcbiAgYXdhaXQgb3JpZ2luYWxIYW5kbGVyKG1vY2tSZXEsIG1vY2tSZXMpO1xuICBcbiAgLy8gQ29udmVydCB0byBOZXRsaWZ5IFJlc3BvbnNlXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgdHlwZW9mIHJlc3BvbnNlQm9keSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShyZXNwb25zZUJvZHkpIDogcmVzcG9uc2VCb2R5LFxuICAgIHtcbiAgICAgIHN0YXR1czogc3RhdHVzQ29kZSxcbiAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVyc1xuICAgIH1cbiAgKTtcbn07XG5cbi8vIE1vZGVybiBOZXRsaWZ5IEZ1bmN0aW9uIGhhbmRsZXJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgcmV0dXJuIGV4cHJlc3NUb05ldGxpZnkocmVxLCBjb250ZXh0KTtcbn07XG5cbi8vIENvbmZpZ3VyZSByb3V0aW5nXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBwYXRoOiBcIi9hcGkvZGlhZ25vc3RpY1wiXG59O1xuIiwgIi8qKlxuICogRGlhZ25vc3RpYyBBUEkgRW5kcG9pbnRcbiAqIFxuICogVGhpcyB1dGlsaXR5IGVuZHBvaW50IGhlbHBzIGRlYnVnIGlzc3VlcyB3aXRoIHRoZSBOZXRsaWZ5IEZ1bmN0aW9ucyBkZXBsb3ltZW50LlxuICogSXQgcmVwb3J0cyBvbiB2YXJpb3VzIGFzcGVjdHMgb2YgdGhlIGVudmlyb25tZW50IGFuZCBjb25maWd1cmF0aW9uLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICAvLyBDb2xsZWN0IGVudmlyb25tZW50IGluZm9ybWF0aW9uXG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB7XG4gICAgICBub2RlVmVyc2lvbjogcHJvY2Vzcy52ZXJzaW9uLFxuICAgICAgbmV0bGlmeURldjogcHJvY2Vzcy5lbnYuTkVUTElGWV9ERVYgPT09ICd0cnVlJyxcbiAgICAgIGNvbnRleHQ6IHByb2Nlc3MuZW52LkNPTlRFWFQgfHwgJ3Vua25vd24nLFxuICAgICAgbmV0bGlmeUxvY2FsOiBwcm9jZXNzLmVudi5ORVRMSUZZX0xPQ0FMID09PSAndHJ1ZScsXG4gICAgICBkYXRhYmFzZVVybDogcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMID8gYFByZXNlbnQgKGxlbmd0aDogJHtwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwubGVuZ3RofSlgIDogJ05vdCBzZXQnLFxuICAgICAgZW52OiBPYmplY3Qua2V5cyhwcm9jZXNzLmVudikuZmlsdGVyKGtleSA9PiAha2V5LmluY2x1ZGVzKCdTRUNSRVQnKSAmJiAha2V5LmluY2x1ZGVzKCdLRVknKSAmJiAha2V5LmluY2x1ZGVzKCdUT0tFTicpICYmICFrZXkuaW5jbHVkZXMoJ1BBU1NXT1JEJykpLFxuICAgIH07XG5cbiAgICAvLyBBdHRlbXB0IHRvIGltcG9ydCBzdG9yYWdlIG1vZHVsZSBhbmQgcmVsYXRlZCBkZXBlbmRlbmNpZXNcbiAgICBsZXQgc3RvcmFnZVN0YXR1cyA9ICdVbmtub3duJztcbiAgICBsZXQgcGdTdGF0dXMgPSAnTm90IHRlc3RlZCc7XG4gICAgbGV0IGltcG9ydEVycm9ycyA9IFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEltcG9ydCBzdG9yYWdlIGFuZCBjaGVjayB0eXBlXG4gICAgICBjb25zdCB7IHN0b3JhZ2UgfSA9IGF3YWl0IGltcG9ydCgnLi9fc3RvcmFnZS5qcycpO1xuICAgICAgc3RvcmFnZVN0YXR1cyA9IHN0b3JhZ2UgPyBgU3RvcmFnZSBvYmplY3QgZXhpc3RzICh0eXBlOiAke3R5cGVvZiBzdG9yYWdlfSlgIDogJ1N0b3JhZ2Ugb2JqZWN0IG1pc3NpbmcnO1xuXG4gICAgICAvLyBDaGVjayBpZiBwZyBtb2R1bGUgaXMgYXZhaWxhYmxlXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwZyA9IGF3YWl0IGltcG9ydCgncGcnKTtcbiAgICAgICAgcGdTdGF0dXMgPSBwZyA/ICdwZyBtb2R1bGUgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5JyA6ICdwZyBtb2R1bGUgaW1wb3J0IHJldHVybmVkIHVuZGVmaW5lZCc7XG4gICAgICB9IGNhdGNoIChwZ0Vycm9yKSB7XG4gICAgICAgIHBnU3RhdHVzID0gYEVycm9yIGltcG9ydGluZyBwZzogJHtwZ0Vycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgaW1wb3J0RXJyb3JzLnB1c2goeyBtb2R1bGU6ICdwZycsIGVycm9yOiBwZ0Vycm9yLm1lc3NhZ2UgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoc3RvcmFnZUVycm9yKSB7XG4gICAgICBzdG9yYWdlU3RhdHVzID0gYEVycm9yIGltcG9ydGluZyBzdG9yYWdlOiAke3N0b3JhZ2VFcnJvci5tZXNzYWdlfWA7XG4gICAgICBpbXBvcnRFcnJvcnMucHVzaCh7IG1vZHVsZTogJ3N0b3JhZ2UnLCBlcnJvcjogc3RvcmFnZUVycm9yLm1lc3NhZ2UgfSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZmlsZSBhY2Nlc3NcbiAgICBsZXQgZmlsZUFjY2VzcyA9IHtcbiAgICAgIHN0YXR1czogJ05vdCBjaGVja2VkJ1xuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZnMgPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XG4gICAgICBjb25zdCBwYXRoID0gYXdhaXQgaW1wb3J0KCdwYXRoJyk7XG4gICAgICBcbiAgICAgIC8vIEdldCBjdXJyZW50IGZpbGUgbG9jYXRpb25cbiAgICAgIGNvbnN0IGN1cnJlbnRGaWxlID0gbmV3IFVSTChpbXBvcnQubWV0YS51cmwpLnBhdGhuYW1lO1xuICAgICAgY29uc3QgY3VycmVudERpciA9IHBhdGguZGlybmFtZShjdXJyZW50RmlsZSk7XG4gICAgICBcbiAgICAgIC8vIExpc3QgZmlsZXMgaW4gYXBpIGRpcmVjdG9yeVxuICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhjdXJyZW50RGlyKTtcbiAgICAgIFxuICAgICAgZmlsZUFjY2VzcyA9IHtcbiAgICAgICAgc3RhdHVzOiAnU3VjY2VzcycsXG4gICAgICAgIGN1cnJlbnRGaWxlLFxuICAgICAgICBjdXJyZW50RGlyLFxuICAgICAgICBmaWxlc1xuICAgICAgfTtcbiAgICB9IGNhdGNoIChmc0Vycm9yKSB7XG4gICAgICBmaWxlQWNjZXNzID0ge1xuICAgICAgICBzdGF0dXM6ICdFcnJvcicsXG4gICAgICAgIG1lc3NhZ2U6IGZzRXJyb3IubWVzc2FnZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gZGlhZ25vc3RpYyBpbmZvcm1hdGlvblxuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ0RpYWdub3N0aWMgaW5mb3JtYXRpb24gZ2F0aGVyZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgcmVxdWVzdFBhdGg6IHJlcS51cmwsXG4gICAgICByZXF1ZXN0TWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBzdG9yYWdlOiB7XG4gICAgICAgIHN0YXR1czogc3RvcmFnZVN0YXR1cyxcbiAgICAgICAgcGdTdGF0dXNcbiAgICAgIH0sXG4gICAgICBmaWxlQWNjZXNzLFxuICAgICAgaW1wb3J0RXJyb3JzOiBpbXBvcnRFcnJvcnMubGVuZ3RoID4gMCA/IGltcG9ydEVycm9ycyA6IG51bGwsXG4gICAgICByZXF1ZXN0SGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyhyZXEuaGVhZGVycyB8fCB7fSlcbiAgICAgICAgICAuZmlsdGVyKChba2V5XSkgPT4gIWtleS5pbmNsdWRlcygnYXV0aG9yaXphdGlvbicpICYmICFrZXkuaW5jbHVkZXMoJ2Nvb2tpZScpKVxuICAgICAgKVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0RpYWdub3N0aWMgZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBnYXRoZXJpbmcgZGlhZ25vc3RpYyBpbmZvcm1hdGlvbicsXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFja1xuICAgIH0pO1xuICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlZQSxTQUFTLG1CQUFtQixPQUFPO0FBQ2pDLE1BQUksQ0FBQyxNQUFNO0FBQVksV0FBTztBQUU5QixRQUFNLFFBQVEsb0JBQUksS0FBSztBQUN2QixRQUFNLFlBQVksTUFBTSxPQUFPO0FBRS9CLE1BQUksTUFBTSxlQUFlLFNBQVM7QUFFaEMsUUFBSSxNQUFNLGVBQWU7QUFBSyxhQUFPO0FBR3JDLFdBQU8sTUFBTSxXQUFXLFNBQVMsVUFBVSxTQUFTLENBQUM7QUFBQSxFQUN2RDtBQUVBLE1BQUksTUFBTSxlQUFlLFVBQVU7QUFFakMsUUFBSSxNQUFNLGVBQWU7QUFBSyxhQUFPO0FBR3JDLFdBQU8sTUFBTSxXQUFXLFNBQVMsVUFBVSxTQUFTLENBQUM7QUFBQSxFQUN2RDtBQUVBLFNBQU87QUFDVDtBQUdBLFNBQVMsd0JBQXdCO0FBRS9CLFFBQU0sU0FBUztBQUFBLElBQ2IsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsWUFBVyxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLElBQ2xDLFlBQVcsb0JBQUksS0FBSyxHQUFF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QUNULFNBQVM7QUFBQSxNQUNULE9BQU8sTUFBTTtBQUFBLE1BQ2IsT0FBTyxNQUFNO0FBQUEsSUFDZixDQUFDO0FBQUEsRUFDSDtBQUNGOzs7QUQ3RkEsSUFBTSxtQkFBbUIsT0FBTyxLQUFLLFlBQVk7QUFFL0MsUUFBTSxVQUFVO0FBQUEsSUFDZCxRQUFRLElBQUk7QUFBQSxJQUNaLEtBQUssSUFBSTtBQUFBLElBQ1QsTUFBTSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7QUFBQSxJQUN2QixPQUFPLE9BQU8sWUFBWSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsWUFBWTtBQUFBLElBQ3ZELFNBQVMsT0FBTyxZQUFZLElBQUksT0FBTztBQUFBLElBQ3ZDLE1BQU0sSUFBSSxPQUFPLE1BQU0sSUFBSSxLQUFLLElBQUk7QUFBQSxJQUNwQyxRQUFRLFFBQVEsVUFBVSxDQUFDO0FBQUEsRUFDN0I7QUFFQSxNQUFJLGFBQWE7QUFDakIsTUFBSSxlQUFlLENBQUM7QUFDcEIsTUFBSSxrQkFBa0IsQ0FBQztBQUd2QixRQUFNLFVBQVU7QUFBQSxJQUNkLFFBQVEsQ0FBQyxTQUFTO0FBQ2hCLG1CQUFhO0FBQ2IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLE1BQU0sQ0FBQyxTQUFTO0FBQ2QscUJBQWU7QUFDZixzQkFBZ0IsY0FBYyxJQUFJO0FBQ2xDLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLENBQUMsU0FBUztBQUNkLHFCQUFlO0FBQ2YsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFdBQVcsQ0FBQyxNQUFNLFVBQVU7QUFDMUIsc0JBQWdCLElBQUksSUFBSTtBQUN4QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsS0FBSyxDQUFDLE1BQU0sVUFBVTtBQUNwQixzQkFBZ0IsSUFBSSxJQUFJO0FBQ3hCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxLQUFLLE1BQU07QUFBQSxJQUFDO0FBQUEsRUFDZDtBQUdBLFFBQU1DLFNBQWdCLFNBQVMsT0FBTztBQUd0QyxTQUFPLElBQUk7QUFBQSxJQUNULE9BQU8saUJBQWlCLFdBQVcsS0FBSyxVQUFVLFlBQVksSUFBSTtBQUFBLElBQ2xFO0FBQUEsTUFDRSxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8scUJBQVEsT0FBTyxLQUFLLFlBQVk7QUFDckMsU0FBTyxpQkFBaUIsS0FBSyxPQUFPO0FBQ3RDO0FBR08sSUFBTSxTQUFTO0FBQUEsRUFDcEIsTUFBTTtBQUNSOyIsCiAgIm5hbWVzIjogWyJpc0hhYml0QWN0aXZlVG9kYXkiLCAiaGFuZGxlciIsICJzdG9yYWdlIiwgImhhbmRsZXIiXQp9Cg==
