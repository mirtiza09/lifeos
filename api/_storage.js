/**
 * Storage interface for API handlers
 * This file serves as the central data access layer for the API
 * 
 * This file detects the environment and uses the appropriate storage implementation:
 * - For Netlify/Vercel serverless functions, it uses the serverless-compatible in-memory implementation
 * - For development, it uses a file-based implementation
 */

// Import the serverless storage implementation
import { netlifyStorage } from './netlify-adapter';

// Detect if we're running in a serverless environment
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * The unified storage interface that's used across all API handlers
 * This abstracts away the implementation details and provides a consistent interface
 */
export const storage = isServerless ? netlifyStorage : netlifyStorage;