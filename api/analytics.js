import { storage } from '../server/storage';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Just get today's analytics
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const analytics = await storage.getDailyAnalytics(today);
      
      if (!analytics) {
        // If no analytics exist for today, generate them on-the-fly
        const newAnalytics = await storage.logDailyAnalytics();
        return res.json(newAnalytics);
      }
      
      return res.json(analytics);
    } else if (req.method === 'POST') {
      // Force a log of analytics (used for testing or manual triggering)
      // Can accept a specific date in the body
      const { date } = req.body || {};
      
      // Log analytics with the provided date or default to today
      const analytics = await storage.logDailyAnalytics(date);
      
      return res.json(analytics);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Failed to process analytics request' });
  }
}