import { storage } from '../../server/storage';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get query parameters with default values
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required query parameters' });
      }
      
      // Validate date formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' });
      }
      
      const analyticsData = await storage.getDailyAnalyticsRange(startDate, endDate);
      
      return res.json(analyticsData);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics range API error:', error);
    return res.status(500).json({ error: 'Failed to retrieve analytics range' });
  }
}