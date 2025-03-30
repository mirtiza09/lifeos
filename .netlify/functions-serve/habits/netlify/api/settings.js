// API endpoint for managing application settings
import { storage } from './_storage';
import { withErrorHandler } from './_error-handler';

export default withErrorHandler(async function handler(req, res) {
  // GET - Retrieve all settings
  if (req.method === 'GET') {
    try {
      // Get day start time setting
      const dayStartTime = await storage.getDayStartTime();
      
      // Additional settings can be added here in the future
      
      return res.status(200).json({
        settings: {
          dayStartTime,
          // Add more settings here as needed
          version: '1.0.0',
          defaultCategories: ['Health', 'Career', 'Finances', 'Personal', 'Analytics']
        }
      });
    } catch (error) {
      throw new Error(`Error retrieving settings: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
});