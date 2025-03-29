// Sync service to manage offline/online data synchronization

import { isOnline } from './networkUtils';
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
  deletePendingAction,
  cleanupSyncedActions,
  PendingAction
} from './offlineStorage';
import { Habit, Task, Note } from './types';
import { queryClient } from './queryClient';

// Initialize sync service
let syncInProgress = false;
let syncInterval: NodeJS.Timeout | null = null;

// Process API call with offline support
export const processApiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  entity: 'task' | 'habit' | 'setting' | 'note',
  entityId?: number,
  action?: 'create' | 'update' | 'delete' | 'complete' | 'fail' | 'increment' | 'decrement',
  data?: any
): Promise<any> => {
  // If online, try to make the API call directly
  if (isOnline()) {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // For GET requests or when the response has content
      if (method === 'GET' || response.headers.get('content-length') !== '0') {
        const result = await response.json();
        
        // Update local offline storage with the latest data
        if (entity === 'task' && action !== 'delete') {
          await saveOfflineTask(result);
        } else if (entity === 'habit' && action !== 'delete') {
          await saveOfflineHabit(result);
        } else if (entity === 'note' && action !== 'delete') {
          await saveOfflineNote(result);
        }
        
        return result;
      }
      
      // For successful requests that don't return content
      return null;
    } catch (error) {
      console.error('API request failed, falling back to offline:', error);
      // If API call fails even when online, store as pending action
      await addPendingAction({
        entity,
        entityId,
        action: action || (method === 'POST' ? 'create' : method === 'PATCH' ? 'update' : method === 'DELETE' ? 'delete' : 'update'),
        data,
        endpoint,
        method
      });
      
      // Fall back to offline handling
      return handleOfflineOperation(entity, entityId, method, data);
    }
  } else {
    // When offline, store the action for later sync
    await addPendingAction({
      entity,
      entityId,
      action: action || (method === 'POST' ? 'create' : method === 'PATCH' ? 'update' : method === 'DELETE' ? 'delete' : 'update'),
      data,
      endpoint,
      method
    });
    
    // Handle offline operation
    return handleOfflineOperation(entity, entityId, method, data);
  }
};

// Handle operations when offline
const handleOfflineOperation = async (
  entity: 'task' | 'habit' | 'setting' | 'note',
  entityId?: number,
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  data?: any
): Promise<any> => {
  try {
    // For GET requests, return data from offline storage
    if (method === 'GET') {
      if (entity === 'task') {
        if (entityId) {
          const tasks = await getOfflineTasks();
          return tasks.find(task => task.id === entityId) || null;
        } else {
          return getOfflineTasks();
        }
      } else if (entity === 'habit') {
        if (entityId) {
          const habits = await getOfflineHabits();
          return habits.find(habit => habit.id === entityId) || null;
        } else {
          return getOfflineHabits();
        }
      } else if (entity === 'note') {
        if (entityId) {
          const notes = await getOfflineNotes();
          return notes.find((note: Note) => note.id === entityId) || null;
        } else if (data && data.category) {
          return getOfflineNoteByCategory(data.category);
        } else {
          return getOfflineNotes();
        }
      }
    }
    
    // For POST (create) requests
    if (method === 'POST') {
      if (entity === 'task' && data) {
        // Generate a temporary negative ID to avoid conflicts with server IDs
        const tempId = -Date.now();
        const newTask: Task = { ...data, id: tempId, createdAt: new Date().toISOString() };
        await saveOfflineTask(newTask);
        return newTask;
      } else if (entity === 'habit' && data) {
        const tempId = -Date.now();
        const newHabit: Habit = { ...data, id: tempId };
        await saveOfflineHabit(newHabit);
        return newHabit;
      } else if (entity === 'note' && data) {
        const tempId = -Date.now();
        const now = new Date().toISOString();
        const newNote: Note = { 
          ...data, 
          id: tempId, 
          createdAt: data.createdAt || now, 
          updatedAt: data.updatedAt || now 
        };
        await saveOfflineNote(newNote);
        return newNote;
      }
    }
    
    // For PATCH (update) requests
    if (method === 'PATCH' && entityId) {
      if (entity === 'task') {
        const tasks = await getOfflineTasks();
        const taskIndex = tasks.findIndex(task => task.id === entityId);
        
        if (taskIndex !== -1) {
          const updatedTask = { ...tasks[taskIndex], ...data };
          await saveOfflineTask(updatedTask);
          return updatedTask;
        }
      } else if (entity === 'habit') {
        const habits = await getOfflineHabits();
        const habitIndex = habits.findIndex(habit => habit.id === entityId);
        
        if (habitIndex !== -1) {
          const updatedHabit = { ...habits[habitIndex], ...data };
          await saveOfflineHabit(updatedHabit);
          return updatedHabit;
        }
      } else if (entity === 'note') {
        const notes = await getOfflineNotes();
        const noteIndex = notes.findIndex((note: Note) => note.id === entityId);
        
        if (noteIndex !== -1) {
          const updatedNote = { 
            ...notes[noteIndex], 
            ...data, 
            updatedAt: new Date().toISOString() 
          };
          await saveOfflineNote(updatedNote);
          return updatedNote;
        }
      }
    }
    
    // For DELETE requests
    if (method === 'DELETE' && entityId) {
      if (entity === 'task') {
        await deleteOfflineTask(entityId);
      } else if (entity === 'habit') {
        await deleteOfflineHabit(entityId);
      } else if (entity === 'note') {
        await deleteOfflineNote(entityId);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Offline operation failed:', error);
    return null;
  }
};

// Synchronize local data with the server
export const syncWithServer = async (): Promise<void> => {
  // Prevent multiple sync processes running at the same time
  if (syncInProgress || !isOnline()) {
    return;
  }
  
  try {
    syncInProgress = true;
    
    // Get all pending actions
    const pendingActions = await getPendingActions();
    const actionsToSync = pendingActions.filter(action => !action.synced);
    
    if (actionsToSync.length === 0) {
      return;
    }
    
    console.log(`Syncing ${actionsToSync.length} pending actions with server...`);
    
    // Process each pending action in order of timestamp
    for (const action of actionsToSync.sort((a, b) => a.timestamp - b.timestamp)) {
      try {
        // Skip actions if their entity was already deleted in a previous action
        if (action.entity === 'task' && action.entityId && action.action !== 'delete') {
          const isDeleted = actionsToSync.some(a => 
            a.entity === 'task' && 
            a.entityId === action.entityId && 
            a.action === 'delete' && 
            a.timestamp < action.timestamp
          );
          
          if (isDeleted) {
            await markActionAsSynced(action.id);
            continue;
          }
        }
        
        // Skip actions if their entity was already deleted in a previous action
        if (action.entity === 'habit' && action.entityId && action.action !== 'delete') {
          const isDeleted = actionsToSync.some(a => 
            a.entity === 'habit' && 
            a.entityId === action.entityId && 
            a.action === 'delete' && 
            a.timestamp < action.timestamp
          );
          
          if (isDeleted) {
            await markActionAsSynced(action.id);
            continue;
          }
        }
        
        // Skip actions if their entity was already deleted in a previous action
        if (action.entity === 'note' && action.entityId && action.action !== 'delete') {
          const isDeleted = actionsToSync.some(a => 
            a.entity === 'note' && 
            a.entityId === action.entityId && 
            a.action === 'delete' && 
            a.timestamp < action.timestamp
          );
          
          if (isDeleted) {
            await markActionAsSynced(action.id);
            continue;
          }
        }
        
        // Handle temporary IDs for new entities
        let endpoint = action.endpoint;
        let data = action.data;
        
        // If we're dealing with a temporary ID (negative number), we need special handling
        if (action.entityId && action.entityId < 0 && action.action !== 'create') {
          // Find the create action for this entity to get its real ID
          const createAction = actionsToSync.find(a => 
            a.entity === action.entity && 
            a.action === 'create' && 
            a.data?.id === action.entityId
          );
          
          if (createAction && createAction.synced) {
            // If the create action is synced, we have a real ID now
            if (typeof createAction.data?.realId === 'number') {
              endpoint = endpoint.replace(`/${action.entityId}`, `/${createAction.data.realId}`);
              if (data) {
                data = { ...data, id: createAction.data.realId };
              }
            } else {
              // Skip this action as we can't process it without a real ID
              console.warn('Skipping action as no real ID is available:', action);
              continue;
            }
          } else {
            // Skip this action and process it in the next sync cycle
            console.warn('Skipping action as create action is not synced yet:', action);
            continue;
          }
        }
        
        // Execute the API call
        const response = await fetch(endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: action.method !== 'GET' ? JSON.stringify(data) : undefined,
        });
        
        if (!response.ok) {
          throw new Error(`Sync failed with status ${response.status}`);
        }
        
        // If it's a create action, store the real ID assigned by the server
        if (action.action === 'create' && action.entityId && action.entityId < 0) {
          const result = await response.json();
          if (result && typeof result.id === 'number') {
            // Update the pending action with the real ID
            action.data = { ...action.data, realId: result.id };
            
            // Update the offline storage to replace the temporary ID with the real one
            if (action.entity === 'task') {
              const tasks = await getOfflineTasks();
              const task = tasks.find(t => t.id === action.entityId);
              if (task) {
                await deleteOfflineTask(action.entityId);
                await saveOfflineTask({ ...task, id: result.id });
              }
            } else if (action.entity === 'habit') {
              const habits = await getOfflineHabits();
              const habit = habits.find(h => h.id === action.entityId);
              if (habit) {
                await deleteOfflineHabit(action.entityId);
                await saveOfflineHabit({ ...habit, id: result.id });
              }
            } else if (action.entity === 'note') {
              const notes = await getOfflineNotes();
              const note = notes.find((n: Note) => n.id === action.entityId);
              if (note) {
                await deleteOfflineNote(action.entityId);
                await saveOfflineNote({ ...note, id: result.id });
              }
            }
          }
        }
        
        // Mark action as synced
        await markActionAsSynced(action.id);
        
        // If the action was successful, invalidate related queries
        if (action.entity === 'task') {
          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        } else if (action.entity === 'habit') {
          queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
        } else if (action.entity === 'setting') {
          queryClient.invalidateQueries({ queryKey: ['/api/day-start-time'] });
        } else if (action.entity === 'note') {
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          // If we have category info, also invalidate the specific category
          if (action.data?.category) {
            queryClient.invalidateQueries({ queryKey: ['/api/notes/category', action.data.category] });
          }
        }
        
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        // We'll retry this action in the next sync cycle
      }
    }
    
    // Clean up old synced actions
    await cleanupSyncedActions();
    
  } catch (error) {
    console.error('Sync process failed:', error);
  } finally {
    syncInProgress = false;
  }
};

// Start periodic sync process
export const startSyncService = (intervalMs: number = 30000): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Try to sync immediately
  syncWithServer();
  
  // Set up periodic sync
  syncInterval = setInterval(() => {
    if (isOnline()) {
      syncWithServer();
    }
  }, intervalMs);
};

// Stop sync service
export const stopSyncService = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};