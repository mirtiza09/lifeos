import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Note } from '@shared/schema';

// Define the interface for the API response
interface NoteResponse extends Note {}

// Type for API request options
interface ApiRequestOptions {
  method: string;
  data?: any;
}

export function useNotes() {
  const queryClient = useQueryClient();

  // Get all notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['/api/notes'],
    enabled: true
  });

  // Get note by category
  const useNoteByCategory = (category: string) => {
    return useQuery({
      queryKey: ['/api/notes/category', category],
      queryFn: async () => {
        try {
          return await apiRequest(`/api/notes/category/${category}`, { method: 'GET' });
        } catch (error: any) {
          // If note doesn't exist for this category, return null instead of throwing
          if (error.status === 404) {
            return null;
          }
          throw error;
        }
      }
    });
  };

  // Create a new note
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { category: string; content: string }) => {
      const now = new Date().toISOString();
      
      console.log('Creating new note:', {
        ...noteData,
        createdAt: now,
        updatedAt: now
      });
      
      return await apiRequest('/api/notes', {
        method: 'POST',
        data: {
          ...noteData,
          createdAt: now,
          updatedAt: now
        }
      });
    },
    onSuccess: (data) => {
      console.log('Note created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes/category', data.category] });
    }
  });

  // Update an existing note
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Note> }) => {
      // Make sure we have a valid ID
      if (!id || isNaN(id)) {
        throw new Error('Invalid note ID for update');
      }
      
      console.log(`Updating note ${id} with data:`, data);
      
      return await apiRequest(`/api/notes/${id}`, {
        method: 'PATCH',
        data: {
          ...data,
          updatedAt: new Date().toISOString()
        }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes/category', data.category] });
    }
  });

  // Create or update note for a category
  const saveNote = async (category: string, content: string) => {
    try {
      // Try to get the existing note for this category
      const existingNote = await apiRequest(`/api/notes/category/${category}`, { method: 'GET' })
        .catch(() => null);

      if (existingNote && existingNote.id) {
        // Update existing note
        return await updateNoteMutation.mutateAsync({
          id: existingNote.id,
          data: { content }
        });
      } else {
        // Create new note
        return await createNoteMutation.mutateAsync({
          category,
          content
        });
      }
    } catch (error: any) {
      console.error('Failed to save note:', error);
      throw error;
    }
  };

  return {
    notes,
    isLoadingNotes,
    useNoteByCategory,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    saveNote,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending
  };
}