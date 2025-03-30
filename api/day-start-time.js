// API endpoint for managing the day start time setting
import { storage } from './_storage';
import { withErrorHandler, validateRequiredFields } from './_error-handler';

async function dayStartTimeHandler(req, res) {
  // GET - Retrieve day start time
  if (req.method === 'GET') {
    try {
      const dayStartTime = await storage.getDayStartTime();
      return res.status(200).json({ dayStartTime });
    } catch (error) {
      throw new Error(`Error retrieving day start time: ${error.message}`);
    }
  }
  
  // PUT - Update day start time
  if (req.method === 'PUT') {
    try {
      validateRequiredFields(req, ['time']);
      const { time } = req.body;
      
      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 
      if (!timeRegex.test(time)) {
        return res.status(400).json({
          error: true,
          message: "Invalid time format. Please use HH:MM in 24-hour format (e.g., 08:30)."
        });
      }
      
      const updatedTime = await storage.setDayStartTime(time);
      return res.status(200).json({ dayStartTime: updatedTime });
    } catch (error) {
      throw new Error(`Error updating day start time: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(dayStartTimeHandler);