// API endpoint for marking a habit as complete
import { storage } from '../../_storage';
import { withErrorHandler, validateId } from '../../_error-handler';

async function completeHabitHandler(req, res) {
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
    
    // Check if the habit is active today
    if (!habit.isActiveToday) {
      return res.status(400).json({
        error: true,
        message: "This habit is not active today based on its repeat schedule."
      });
    }
    
    // Complete the habit
    const updatedHabit = await storage.completeHabit(id);
    
    return res.status(200).json(updatedHabit);
  } catch (error) {
    throw new Error(`Error completing habit: ${error.message}`);
  }
}

export default withErrorHandler(completeHabitHandler);