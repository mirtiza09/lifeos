// Example Vercel serverless function for individual habit operations
import { storage } from '../../server/storage';

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
    // GET /api/habits/[id] - Get a specific habit
    if (req.method === 'GET') {
      const habit = await storage.getHabit(habitId);
      if (!habit) {
        res.status(404).json({ message: 'Habit not found' });
        return;
      }
      res.status(200).json(habit);
    } 
    // PATCH /api/habits/[id] - Update a habit
    else if (req.method === 'PATCH') {
      const updatedHabit = await storage.updateHabit(habitId, req.body);
      if (!updatedHabit) {
        res.status(404).json({ message: 'Habit not found' });
        return;
      }
      res.status(200).json(updatedHabit);
    } 
    // DELETE /api/habits/[id] - Delete a habit
    else if (req.method === 'DELETE') {
      const deleted = await storage.deleteHabit(habitId);
      if (!deleted) {
        res.status(404).json({ message: 'Habit not found' });
        return;
      }
      res.status(204).end();
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