/**
 * Storage interface for API handlers
 * This file serves as the central data access layer for the API
 * 
 * This file uses the PostgreSQL storage implementation for production environments
 * and falls back to in-memory storage for development if DATABASE_URL is not set.
 */

/**
 * Default export handler for Netlify Functions compatibility
 * This empty handler is required for the Netlify Function wrapper to work correctly
 */
export default async function handler(req, res) {
  res.status(200).json({ 
    message: "This is a utility module and shouldn't be called directly",
    success: true
  });
}

// Import both storage implementations
import { netlifyStorage } from './netlify-adapter';
import { pgStorage } from './pg-netlify-adapter';

// Decide which storage implementation to use based on environment
let selectedStorage;

// Production mode with DATABASE_URL - use Postgres
if (process.env.DATABASE_URL) {
  console.log('Using PostgreSQL storage for Netlify Functions');
  selectedStorage = pgStorage;
} 
// Fallback to in-memory storage
else {
  console.log('DATABASE_URL not found, using in-memory storage (not recommended for production)');
  selectedStorage = netlifyStorage;
}

/**
 * The unified storage interface that's used across all API handlers
 * This abstracts away the implementation details and provides a consistent interface
 */
export const storage = selectedStorage;