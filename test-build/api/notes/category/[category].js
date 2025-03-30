// API endpoint for managing notes by category
import { storage } from '../../_storage';
import { withErrorHandler, validateRequiredFields } from '../../_error-handler';

export default withErrorHandler(async function handler(req, res) {
  // Get the category from the URL parameter
  const { category } = req.query;
  
  if (!category) {
    throw new Error('Category parameter is required');
  }
  
  // GET - Retrieve a note by category
  if (req.method === 'GET') {
    try {
      const note = await storage.getNoteByCategory(category);
      
      if (!note) {
        return res.status(404).json({ 
          error: true, 
          message: `Note for category '${category}' not found` 
        });
      }
      
      return res.status(200).json(note);
    } catch (error) {
      throw new Error(`Error retrieving note: ${error.message}`);
    }
  }
  
  // POST - Create a new note for this category
  if (req.method === 'POST') {
    try {
      validateRequiredFields(req, ['content']);
      const { content } = req.body;
      
      // Check if a note already exists for this category
      const existingNote = await storage.getNoteByCategory(category);
      
      if (existingNote) {
        // Update existing note
        const updatedNote = await storage.updateNote(existingNote.id, { 
          content,
          updatedAt: new Date().toISOString()
        });
        return res.status(200).json(updatedNote);
      } else {
        // Create new note
        const newNote = await storage.createNote({
          category,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return res.status(201).json(newNote);
      }
    } catch (error) {
      throw new Error(`Error creating/updating note: ${error.message}`);
    }
  }
  
  // PUT - Update an existing note for this category
  if (req.method === 'PUT') {
    try {
      validateRequiredFields(req, ['content']);
      const { content } = req.body;
      
      // Find the note by category
      const existingNote = await storage.getNoteByCategory(category);
      
      if (!existingNote) {
        return res.status(404).json({ 
          error: true, 
          message: `Note for category '${category}' not found` 
        });
      }
      
      // Update the note
      const updatedNote = await storage.updateNote(existingNote.id, { 
        content,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json(updatedNote);
    } catch (error) {
      throw new Error(`Error updating note: ${error.message}`);
    }
  }
  
  // DELETE - Delete a note for this category
  if (req.method === 'DELETE') {
    try {
      // Find the note by category
      const existingNote = await storage.getNoteByCategory(category);
      
      if (!existingNote) {
        return res.status(404).json({ 
          error: true, 
          message: `Note for category '${category}' not found` 
        });
      }
      
      // Delete the note
      await storage.deleteNote(existingNote.id);
      
      return res.status(200).json({ 
        success: true, 
        message: `Note for category '${category}' deleted successfully` 
      });
    } catch (error) {
      throw new Error(`Error deleting note: ${error.message}`);
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).json({ error: true, message: `Method ${req.method} Not Allowed` });
});