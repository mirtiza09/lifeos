// Example Vercel serverless function for habits
import { storage } from '../server/storage';

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

  try {
    // GET /api/habits - Get all habits
    if (req.method === 'GET') {
      const habits = await storage.getHabits();
      res.status(200).json(habits);
    } 
    // POST /api/habits - Create a new habit
    else if (req.method === 'POST') {
      const newHabit = await storage.createHabit(req.body);
      res.status(201).json(newHabit);
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