// Example Vercel serverless function for notes by category
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

  const { category } = req.query;

  try {
    // GET /api/notes/category/[category] - Get notes by category
    if (req.method === 'GET') {
      const note = await storage.getNoteByCategory(category);
      if (!note) {
        // If no note exists for this category, return an empty object
        // so the frontend can create a new one
        res.status(200).json({});
        return;
      }
      res.status(200).json(note);
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