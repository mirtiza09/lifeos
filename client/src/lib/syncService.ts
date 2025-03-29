// Sync service to manage offline/online data synchronization

import { 
  getOfflineTasks, 
  getOfflineHabits, 
  getOfflineNotes,
  getOfflineNoteByCategory,
  saveOfflineTask, 
  saveOfflineHabit,
  saveOfflineNote,
  deleteOfflineTask,
  deleteOfflineHabit,
  deleteOfflineNote,
  addPendingAction, 
  getPendingActions, 
  markActionAsSynced,
  cleanupSyncedActions,
} from './offlineStorage';
import { Habit, Task, Note } from './types';
import { queryClient } from './queryClient';

// Handle operations directly with local storage since we're offline-only
export const processApiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  entity: 'task' | 'habit' | 'setting' | 'note',
  entityId?: number,
  action?: 'create' | 'update' | 'delete' | 'complete' | 'fail' | 'increment' | 'decrement',
  data?: any
): Promise<any> => {
  try {
    // For GET requests, return data from IndexedDB directly
    if (method === 'GET') {
      if (entity === 'task') {
        if (entityId) {
          const tasks = await getOfflineTasks();
          return tasks.find((task: Task) => task.id === entityId) || null;
        } else {
          return await getOfflineTasks();
        }
      } else if (entity === 'habit') {
        if (entityId) {
          const habits = await getOfflineHabits();
          return habits.find((habit: Habit) => habit.id === entityId) || null;
        } else {
          return await getOfflineHabits();
        }
      } else if (entity === 'note') {
        // Check if we're looking for a specific category
        if (endpoint.includes('/category/')) {
          const category = endpoint.split('/category/')[1];
          return await getOfflineNoteByCategory(category);
        } else if (entityId) {
          const notes = await getOfflineNotes();
          return notes.find((note: Note) => note.id === entityId) || null;
        } else {
          return await getOfflineNotes();
        }
      }
      return null;
    }
    
    // For non-GET requests, handle the data manipulation locally
    
    // For non-GET operations, determine the action type
    if (!action) {
      if (method === 'POST') action = 'create';
      else if (method === 'PATCH') action = 'update';
      else if (method === 'DELETE') action = 'delete';
    }
    
    // Generate entity ID for new items
    let localEntityId = entityId;
    let result: any = null;
    
    if (action === 'create') {
      // Generate a new ID for new entities
      // We're always offline, so we can just use a timestamp-based ID
      localEntityId = Date.now();
      
      // Store the entity with the local ID
      if (entity === 'task') {
        const newTask: Task = { ...data, id: localEntityId, createdAt: new Date().toISOString() };
        await saveOfflineTask(newTask);
        result = newTask;
      } else if (entity === 'habit') {
        const newHabit: Habit = { ...data, id: localEntityId };
        await saveOfflineHabit(newHabit);
        result = newHabit;
      } else if (entity === 'note') {
        const newNote: Note = { 
          ...data, 
          id: localEntityId, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveOfflineNote(newNote);
        result = newNote;
      }
    } else if (action === 'update') {
      // For update operations, update the local entity
      if (entity === 'task' && localEntityId) {
        const tasks = await getOfflineTasks();
        const taskIndex = tasks.findIndex((task: Task) => task.id === localEntityId);
        if (taskIndex !== -1) {
          const updatedTask = { ...tasks[taskIndex], ...data };
          await saveOfflineTask(updatedTask);
          result = updatedTask;
        }
      } else if (entity === 'habit' && localEntityId) {
        const habits = await getOfflineHabits();
        const habitIndex = habits.findIndex((habit: Habit) => habit.id === localEntityId);
        if (habitIndex !== -1) {
          const updatedHabit = { ...habits[habitIndex], ...data };
          await saveOfflineHabit(updatedHabit);
          result = updatedHabit;
        }
      } else if (entity === 'note' && localEntityId) {
        const notes = await getOfflineNotes();
        const noteIndex = notes.findIndex((note: Note) => note.id === localEntityId);
        if (noteIndex !== -1) {
          const updatedNote = { 
            ...notes[noteIndex], 
            ...data,
            updatedAt: new Date().toISOString()
          };
          await saveOfflineNote(updatedNote);
          result = updatedNote;
        }
      }
    } else if (action === 'delete') {
      // For delete operations, remove the entity from local storage
      if (entity === 'task' && localEntityId) {
        await deleteOfflineTask(localEntityId);
        result = { success: true };
      } else if (entity === 'habit' && localEntityId) {
        await deleteOfflineHabit(localEntityId);
        result = { success: true };
      } else if (entity === 'note' && localEntityId) {
        await deleteOfflineNote(localEntityId);
        result = { success: true };
      }
    } else if (action === 'complete' || action === 'fail' || action === 'increment' || action === 'decrement') {
      // For habit-specific actions, update the habit state
      if (entity === 'habit' && localEntityId) {
        const habits = await getOfflineHabits();
        const habitIndex = habits.findIndex((habit: Habit) => habit.id === localEntityId);
        if (habitIndex !== -1) {
          let updatedHabit = { ...habits[habitIndex] };
          
          if (action === 'complete') {
            updatedHabit.status = 'completed';
          } else if (action === 'fail') {
            updatedHabit.status = 'failed';
          } else if (action === 'increment' && typeof updatedHabit.value === 'number') {
            updatedHabit.value = (updatedHabit.value || 0) + 1;
          } else if (action === 'decrement' && typeof updatedHabit.value === 'number') {
            updatedHabit.value = Math.max(0, (updatedHabit.value || 0) - 1);
          }
          
          await saveOfflineHabit(updatedHabit);
          result = updatedHabit;
        }
      }
    }
    
    // For offline-only mode, still add to pending actions 
    // to maintain consistent implementation (but we won't ever sync them)
    await addPendingAction({
      entity,
      entityId: localEntityId,
      action: action || (
        method === 'POST' ? 'create' :
        method === 'PATCH' ? 'update' :
        method === 'DELETE' ? 'delete' : 'update'
      ),
      data,
      endpoint,
      method,
    });
    
    // Invalidate queries to ensure UI updates
    if (entity === 'task') {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } else if (entity === 'habit') {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    } else if (entity === 'setting') {
      queryClient.invalidateQueries({ queryKey: ['/api/day-start-time'] });
    } else if (entity === 'note') {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      // If we have category info, also invalidate the specific category
      if (data?.category) {
        queryClient.invalidateQueries({ queryKey: ['/api/notes/category', data.category] });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error processing API call:', error);
    throw error;
  }
};

// These functions are kept as stubs to maintain compatibility with existing code
export const syncWithServer = async (): Promise<void> => {
  // Do nothing in offline-only mode
  console.log('Sync disabled in offline-only mode');
  return;
};

export const startSyncService = (): void => {
  // Do nothing in offline-only mode
  console.log('Sync service disabled in offline-only mode');
};

export const stopSyncService = (): void => {
  // Do nothing in offline-only mode
  console.log('Sync service already disabled in offline-only mode');
};