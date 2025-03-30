// API endpoint for managing individual habits
import { storage } from '../_storage';
import { withErrorHandler, validateId } from '../_error-handler';

async function habitHandler(req, res) {
  // Get the habit ID from the URL parameter
  const id = validateId(req);
  
  // GET - Retrieve a specific habit
  if (req.method === 'GET') {
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
  
  // PATCH - Update a specific habit
  if (req.method === 'PATCH') {
    try {
      const updates = req.body;
      
      // Add updatedAt timestamp
      updates.updatedAt = new Date().toISOString();
      
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
  
  // DELETE - Delete a specific habit
  if (req.method === 'DELETE') {
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
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(habitHandler);