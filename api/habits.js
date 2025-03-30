// API endpoint for managing habits
import { storage } from './_storage';
import { withErrorHandler, validateRequiredFields } from './_error-handler';

async function habitsHandler(req, res) {
  // GET - Retrieve all habits
  if (req.method === 'GET') {
    try {
      const habits = await storage.getHabits();
      return res.status(200).json(habits);
    } catch (error) {
      throw new Error(`Error retrieving habits: ${error.message}`);
    }
  }
  
  // POST - Create a new habit
  if (req.method === 'POST') {
    try {
      validateRequiredFields(req, ['name', 'type', 'repeatType']);
      
      const { 
        name, 
        type, 
        maxValue, 
        repeatType, 
        repeatDays = '*'
      } = req.body;
      
      // Validate habit type
      if (type !== 'boolean' && type !== 'counter') {
        return res.status(400).json({
          error: true,
          message: "Invalid habit type. Type must be 'boolean' or 'counter'."
        });
      }
      
      // Validate repeatType
      if (repeatType !== 'daily' && repeatType !== 'weekly') {
        return res.status(400).json({
          error: true,
          message: "Invalid repeat type. Repeat type must be 'daily' or 'weekly'."
        });
      }
      
      // For counter type, maxValue is required
      if (type === 'counter' && typeof maxValue !== 'number') {
        return res.status(400).json({
          error: true,
          message: "maxValue is required for counter type habits and must be a number."
        });
      }
      
      // Create the habit
      const habit = await storage.createHabit({
        name,
        type,
        currentValue: type === 'counter' ? 0 : undefined,
        maxValue: type === 'counter' ? maxValue : undefined,
        repeatType,
        repeatDays,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return res.status(201).json(habit);
    } catch (error) {
      throw new Error(`Error creating habit: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(habitsHandler);