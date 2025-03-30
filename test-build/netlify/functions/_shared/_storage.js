/**
 * Storage interface for API handlers
 * This file serves as the central data access layer for the API
 * 
 * This file uses the Netlify-compatible storage implementation for all environments,
 * ensuring consistent behavior between development and production.
 */

// Import the Netlify storage implementation
import { netlifyStorage } from './netlify-adapter';

/**
 * The unified storage interface that's used across all API handlers
 * This abstracts away the implementation details and provides a consistent interface
 */
export const storage = netlifyStorage;