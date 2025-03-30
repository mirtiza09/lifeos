// API endpoint for managing tasks
import { storage } from './_storage';
import { withErrorHandler, validateRequiredFields } from './_error-handler';

async function tasksHandler(req, res) {
  // GET - Retrieve all tasks
  if (req.method === 'GET') {
    try {
      const tasks = await storage.getTasks();
      return res.status(200).json(tasks);
    } catch (error) {
      throw new Error(`Error retrieving tasks: ${error.message}`);
    }
  }
  
  // POST - Create a new task
  if (req.method === 'POST') {
    try {
      validateRequiredFields(req, ['text']);
      const { text, completed = false } = req.body;
      
      const task = await storage.createTask({
        text,
        completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return res.status(201).json(task);
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(tasksHandler);