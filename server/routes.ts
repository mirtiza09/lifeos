import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertHabitSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const taskUpdate = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskUpdate);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Habits endpoints
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.get("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const habit = await storage.getHabit(id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const newHabit = await storage.createHabit(habitData);
      res.status(201).json(newHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      console.log(`PATCH request received for habit #${id} with body:`, req.body);
      
      // Validate request body against schema
      const habitUpdate = insertHabitSchema.partial().parse(req.body);
      console.log('Validated habit update data:', habitUpdate);
      
      // Update habit in storage
      const updatedHabit = await storage.updateHabit(id, habitUpdate);
      
      if (!updatedHabit) {
        console.error(`Habit #${id} not found for update`);
        return res.status(404).json({ message: "Habit not found" });
      }
      
      console.log(`Habit #${id} updated successfully, returning:`, updatedHabit);
      res.json(updatedHabit);
    } catch (error) {
      console.error('Error updating habit:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  // Habit actions
  app.patch("/api/habits/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedHabit = await storage.completeHabit(id);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found or not a boolean habit" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete habit" });
    }
  });

  app.patch("/api/habits/:id/fail", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedHabit = await storage.failHabit(id);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found or not a boolean habit" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fail habit" });
    }
  });
  
  app.patch("/api/habits/:id/reset", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedHabit = await storage.resetHabitStatus(id);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found or not a boolean habit" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to reset habit status" });
    }
  });

  app.patch("/api/habits/:id/increment", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedHabit = await storage.incrementHabit(id);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found or not a counter habit" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment habit" });
    }
  });

  app.patch("/api/habits/:id/decrement", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedHabit = await storage.decrementHabit(id);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found or not a counter habit" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to decrement habit" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteHabit(id);
      
      if (!success) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });
  
  // Daily logging endpoint
  app.post("/api/log-daily-data", async (req, res) => {
    try {
      // Optional date parameter in ISO format
      const dateStr = req.body.date;
      const resetHabits = req.body.resetHabits !== false; // Default to true if not specified
      
      // Call the storage method to log data
      storage.logDailyData(dateStr, resetHabits);
      
      res.status(200).json({ 
        message: resetHabits 
          ? "Daily data logged and habits reset successfully" 
          : "Daily data logged successfully (no habit reset)"
      });
    } catch (error) {
      console.error('Error logging daily data:', error);
      res.status(500).json({ message: "Failed to log daily data" });
    }
  });
  
  // Manual habit reset endpoint
  app.post("/api/reset-habits", async (req, res) => {
    try {
      // First log the current state
      storage.logDailyData(undefined, true);
      
      res.status(200).json({ message: "Habits reset successfully" });
    } catch (error) {
      console.error('Error resetting habits:', error);
      res.status(500).json({ message: "Failed to reset habits" });
    }
  });
  
  // Notes endpoints
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const note = await storage.getNoteByCategory(category);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found for this category" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      console.log('Creating note with data:', req.body);
      
      // Check if a note for this category already exists
      if (req.body.category) {
        const existingNote = await storage.getNoteByCategory(req.body.category);
        
        if (existingNote) {
          console.log(`Note for category ${req.body.category} already exists, updating instead`);
          // If note exists, update it instead of creating a new one
          const updatedNote = await storage.updateNote(existingNote.id, { 
            content: req.body.content,
            updatedAt: req.body.updatedAt || new Date().toISOString()
          });
          
          if (updatedNote) {
            return res.json(updatedNote);
          }
        }
      }
      
      // Create a new note
      const noteData = insertNoteSchema.parse(req.body);
      const newNote = await storage.createNote(noteData);
      res.status(201).json(newNote);
    } catch (error) {
      console.error('Error creating note:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        console.error('Invalid note ID:', req.params.id);
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      console.log(`PATCH request for note #${id} with data:`, req.body);
      const noteUpdate = insertNoteSchema.partial().parse(req.body);
      
      const updatedNote = await storage.updateNote(id, noteUpdate);
      
      if (!updatedNote) {
        console.error(`Note with ID ${id} not found for update`);
        return res.status(404).json({ message: "Note not found" });
      }
      
      console.log(`Note #${id} updated successfully`);
      res.json(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });
  
  // Day start time configuration
  // Get the currently configured day start time
  app.get("/api/day-start-time", (req, res) => {
    const currentTime = process.env.DAY_START_TIME || "04:00"; // Default to 4:00 AM
    res.json({ dayStartTime: currentTime });
  });
  
  // Set a new day start time
  app.post("/api/day-start-time", (req, res) => {
    try {
      const { dayStartTime } = req.body;
      
      // Validate time format (HH:MM)
      const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timePattern.test(dayStartTime)) {
        return res.status(400).json({ 
          message: "Invalid time format. Please provide time in HH:MM format (24-hour)" 
        });
      }
      
      // Store the day start time in an environment variable
      process.env.DAY_START_TIME = dayStartTime;
      
      // Log that the day start time was updated
      console.log(`Day start time updated to ${dayStartTime}`);
      
      // Respond with success
      res.json({ 
        message: "Day start time updated successfully", 
        dayStartTime
      });
    } catch (error) {
      console.error('Error updating day start time:', error);
      res.status(500).json({ message: "Failed to update day start time" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
