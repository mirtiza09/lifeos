// Vercel serverless function for database migration
import { setupDatabase, migrateData } from '../server/migrateToPostgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method not allowed' });
      return;
    }

    // Require authentication (in a real app, this would check for admin rights)
    const { secret } = req.query;
    if (!secret || secret !== process.env.MIGRATION_SECRET) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Start the migration process
    res.status(200).json({ message: 'Migration started' });

    // Set up database schema
    await setupDatabase();
    
    // Migrate data from file-based storage to PostgreSQL
    await migrateData();

    // Note: since we've already sent the response, we can't send another one
    // The client will need to check the status through another endpoint or logs
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    // If we haven't sent a response yet, send an error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Migration failed', error: error.message });
    }
  }
}