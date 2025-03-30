// API endpoint for managing individual tasks
import { storage } from '../_storage';
import { withErrorHandler, validateId } from '../_error-handler';

async function taskHandler(req, res) {
  // Get the task ID from the URL parameter
  const id = validateId(req);
  
  // GET - Retrieve a specific task
  if (req.method === 'GET') {
    try {
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ 
          error: true, 
          message: `Task with ID ${id} not found` 
        });
      }
      
      return res.status(200).json(task);
    } catch (error) {
      throw new Error(`Error retrieving task: ${error.message}`);
    }
  }
  
  // PATCH - Update a specific task
  if (req.method === 'PATCH') {
    try {
      const updates = req.body;
      
      // Add updatedAt timestamp
      updates.updatedAt = new Date().toISOString();
      
      const updatedTask = await storage.updateTask(id, updates);
      
      if (!updatedTask) {
        return res.status(404).json({ 
          error: true, 
          message: `Task with ID ${id} not found` 
        });
      }
      
      return res.status(200).json(updatedTask);
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }
  
  // DELETE - Delete a specific task
  if (req.method === 'DELETE') {
    try {
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ 
          error: true, 
          message: `Task with ID ${id} not found` 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: `Task with ID ${id} deleted successfully` 
      });
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(taskHandler);