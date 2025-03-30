// API endpoint for resetting a habit's status
import { storage } from '../../_storage';
import { withErrorHandler, validateId } from '../../_error-handler';

async function resetHabitHandler(req, res) {
  // Only allow PATCH requests for this endpoint
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
  }
  
  try {
    // Get the habit ID from the URL parameter
    const id = validateId(req);
    
    // Get the habit to verify it exists
    const habit = await storage.getHabit(id);
    
    if (!habit) {
      return res.status(404).json({ 
        error: true, 
        message: `Habit with ID ${id} not found` 
      });
    }
    
    // Reset the habit status
    const updatedHabit = await storage.resetHabitStatus(id);
    
    return res.status(200).json(updatedHabit);
  } catch (error) {
    throw new Error(`Error resetting habit status: ${error.message}`);
  }
}

export default withErrorHandler(resetHabitHandler);