// API endpoint to decrement a habit's value
import { storage } from '../../_storage';
import { withErrorHandler, validateId } from '../../_error-handler';

async function decrementHabitHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
  }
  
  try {
    const id = validateId(req);
    
    const habit = await storage.getHabit(id);
    
    if (!habit) {
      return res.status(404).json({ error: true, message: `Habit with ID ${id} not found` });
    }
    
    // Check if the habit is a counter type
    if (habit.type !== 'counter') {
      return res.status(400).json({ 
        error: true, 
        message: `Cannot decrement habit with type '${habit.type}'. Only 'counter' type habits can be decremented.`
      });
    }
    
    const updatedHabit = await storage.decrementHabit(id);
    
    return res.status(200).json(updatedHabit);
  } catch (error) {
    throw new Error(`Error decrementing habit: ${error.message}`);
  }
}

export default withErrorHandler(decrementHabitHandler);