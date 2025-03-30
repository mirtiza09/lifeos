// Example Vercel serverless function for completing a habit
import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const habitId = parseInt(id);

  try {
    // POST /api/habits/[id]/complete - Complete a habit
    if (req.method === 'POST') {
      const habit = await storage.completeHabit(habitId);
      if (!habit) {
        res.status(404).json({ message: 'Habit not found' });
        return;
      }
      res.status(200).json(habit);
    }
    // Method not allowed
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}