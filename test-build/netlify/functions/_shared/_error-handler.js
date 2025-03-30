/**
 * Error Handling Utilities for Netlify Functions
 * 
 * This module provides utility functions for standardized error handling
 * across all API endpoints, making it easier to maintain consistent error responses.
 * These utilities are compatible with both Express-style handlers and modern Netlify Functions.
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
export function withErrorHandler(handler) {
  return async function (req, res) {
    try {
      // Set JSON parsing for all requests
      if (req.method !== 'GET' && req.body === undefined) {
        req.body = {};
      }
      
      // Call the original handler
      return await handler(req, res);
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      
      // Determine status code based on error message
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      else if (error.message.includes('required') || error.message.includes('Invalid')) statusCode = 400;
      else if (error.message.includes('unauthorized') || error.message.includes('forbidden')) statusCode = 403;
      
      // Return a standardized error response
      return res.status(statusCode).json({
        error: true,
        message: error.message
      });
    }
  };
}

/**
 * Validates required fields in the request body
 * @param {Object} req Express request object
 * @param {Array<string>} requiredFields Array of required field names
 * @throws {Error} If any required fields are missing
 */
export function validateRequiredFields(req, requiredFields) {
  if (!req.body) {
    throw new Error('Request body is required');
  }
  
  const missingFields = requiredFields.filter(field => !req.body.hasOwnProperty(field));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Helper function to validate an ID parameter from URL
 * @param {Object} req Express request object
 * @param {string} paramName The name of the ID parameter (defaults to 'id')
 * @returns {number} The parsed ID
 * @throws {Error} If the ID is invalid
 */
export function validateId(req, paramName = 'id') {
  const id = parseInt(req.params[paramName]);
  
  if (isNaN(id)) {
    throw new Error(`Invalid ${paramName} parameter. Expected a number.`);
  }
  
  return id;
}