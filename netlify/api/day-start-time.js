// API endpoint for managing the day start time setting
import { storage } from './_storage';
import { withErrorHandler, validateRequiredFields } from './_error-handler';

async function dayStartTimeHandler(req, res) {
  console.log(`[DAY-START-TIME] Handler called with method: ${req.method}`);
  console.log(`[DAY-START-TIME] Storage implementation: ${storage._implementation || 'unknown'}`);
  
  // GET - Retrieve day start time
  if (req.method === 'GET') {
    try {
      console.log('[DAY-START-TIME] Getting day start time from storage');
      
      // Add a fallback in case the storage method fails
      try {
        const dayStartTime = await storage.getDayStartTime();
        console.log(`[DAY-START-TIME] Successfully retrieved time: ${dayStartTime}`);
        return res.status(200).json({ dayStartTime });
      } catch (storageError) {
        console.error('[DAY-START-TIME] Error in storage.getDayStartTime:', storageError);
        // Return default value as fallback
        console.log('[DAY-START-TIME] Using fallback default time: 04:00');
        return res.status(200).json({ 
          dayStartTime: '04:00',
          _note: 'Using fallback default time due to storage error'
        });
      }
    } catch (error) {
      console.error('[DAY-START-TIME] Outer error in GET handler:', error);
      // Instead of throwing, return a fallback with error info
      return res.status(500).json({
        error: true,
        message: `Error retrieving day start time: ${error.message}`,
        dayStartTime: '04:00', // Fallback default
        _note: 'Using fallback default time due to error'
      });
    }
  }
  
  // PUT - Update day start time
  if (req.method === 'PUT') {
    console.log('[DAY-START-TIME] Updating day start time');
    try {
      validateRequiredFields(req, ['time']);
      const { time } = req.body;
      console.log(`[DAY-START-TIME] Requested time update to: ${time}`);
      
      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 
      if (!timeRegex.test(time)) {
        console.error(`[DAY-START-TIME] Invalid time format: ${time}`);
        return res.status(400).json({
          error: true,
          message: "Invalid time format. Please use HH:MM in 24-hour format (e.g., 08:30)."
        });
      }
      
      try {
        const updatedTime = await storage.setDayStartTime(time);
        console.log(`[DAY-START-TIME] Time successfully updated to: ${updatedTime}`);
        return res.status(200).json({ dayStartTime: updatedTime });
      } catch (storageError) {
        console.error('[DAY-START-TIME] Error in storage.setDayStartTime:', storageError);
        // Return the input value with a note about the error
        return res.status(200).json({ 
          dayStartTime: time,
          _note: 'Time was set but not saved to storage due to an error'
        });
      }
    } catch (error) {
      console.error('[DAY-START-TIME] Outer error in PUT handler:', error);
      return res.status(500).json({
        error: true,
        message: `Error updating day start time: ${error.message}`
      });
    }
  }
  
  // Method not allowed
  console.log(`[DAY-START-TIME] Method not allowed: ${req.method}`);
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
}

export default withErrorHandler(dayStartTimeHandler);