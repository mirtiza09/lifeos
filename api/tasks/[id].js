// Example Vercel serverless function for individual task operations
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
  const taskId = parseInt(id);

  try {
    // GET /api/tasks/[id] - Get a specific task
    if (req.method === 'GET') {
      const task = await storage.getTask(taskId);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.status(200).json(task);
    } 
    // PATCH /api/tasks/[id] - Update a task
    else if (req.method === 'PATCH') {
      const updatedTask = await storage.updateTask(taskId, req.body);
      if (!updatedTask) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.status(200).json(updatedTask);
    } 
    // DELETE /api/tasks/[id] - Delete a task
    else if (req.method === 'DELETE') {
      const deleted = await storage.deleteTask(taskId);
      if (!deleted) {
        res.status(404).json({ message: 'Task not found' });
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