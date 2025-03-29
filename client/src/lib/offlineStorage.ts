// Offline storage with IndexedDB

import { Habit, Task, Note } from './types';

// Define each store we need in our database
const DB_NAME = 'lifeOsOfflineDB';
const DB_VERSION = 2;
const STORES = {
  TASKS: 'tasks',
  HABITS: 'habits',
  NOTES: 'notes',
  PENDING_ACTIONS: 'pendingActions'
};

// Schema for pending sync actions
export interface PendingAction {
  id: string;
  timestamp: number;
  entity: 'task' | 'habit' | 'setting' | 'note';
  entityId?: number;
  action: 'create' | 'update' | 'delete' | 'complete' | 'fail' | 'increment' | 'decrement';
  data?: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  synced: boolean;
}

// Open the database connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Failed to open IndexedDB');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    // Create the object stores when the database is first created
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        db.createObjectStore(STORES.HABITS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to perform a transaction on an object store
const performTransaction = <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    } catch (error) {
      reject(error);
    }
  });
};

// Task operations
export const getOfflineTasks = async (): Promise<Task[]> => {
  try {
    return await performTransaction<Task[]>(
      STORES.TASKS,
      'readonly',
      (store) => store.getAll()
    );
  } catch (error) {
    console.error('Failed to get offline tasks:', error);
    return [];
  }
};

export const saveOfflineTask = async (task: Task): Promise<void> => {
  try {
    await performTransaction(
      STORES.TASKS,
      'readwrite',
      (store) => store.put(task)
    );
  } catch (error) {
    console.error('Failed to save offline task:', error);
  }
};

export const deleteOfflineTask = async (id: number): Promise<void> => {
  try {
    await performTransaction(
      STORES.TASKS,
      'readwrite',
      (store) => store.delete(id)
    );
  } catch (error) {
    console.error('Failed to delete offline task:', error);
  }
};

// Habit operations
export const getOfflineHabits = async (): Promise<Habit[]> => {
  try {
    return await performTransaction<Habit[]>(
      STORES.HABITS,
      'readonly',
      (store) => store.getAll()
    );
  } catch (error) {
    console.error('Failed to get offline habits:', error);
    return [];
  }
};

export const saveOfflineHabit = async (habit: Habit): Promise<void> => {
  try {
    await performTransaction(
      STORES.HABITS,
      'readwrite',
      (store) => store.put(habit)
    );
  } catch (error) {
    console.error('Failed to save offline habit:', error);
  }
};

export const deleteOfflineHabit = async (id: number): Promise<void> => {
  try {
    await performTransaction(
      STORES.HABITS,
      'readwrite',
      (store) => store.delete(id)
    );
  } catch (error) {
    console.error('Failed to delete offline habit:', error);
  }
};

// Note operations
export const getOfflineNotes = async (): Promise<Note[]> => {
  try {
    return await performTransaction<Note[]>(
      STORES.NOTES,
      'readonly',
      (store) => store.getAll()
    );
  } catch (error) {
    console.error('Failed to get offline notes:', error);
    return [];
  }
};

export const getOfflineNoteByCategory = async (category: string): Promise<Note | undefined> => {
  try {
    const notes = await getOfflineNotes();
    return notes.find(note => note.category === category);
  } catch (error) {
    console.error('Failed to get offline note by category:', error);
    return undefined;
  }
};

export const saveOfflineNote = async (note: Note): Promise<void> => {
  try {
    await performTransaction(
      STORES.NOTES,
      'readwrite',
      (store) => store.put(note)
    );
  } catch (error) {
    console.error('Failed to save offline note:', error);
  }
};

export const deleteOfflineNote = async (id: number): Promise<void> => {
  try {
    await performTransaction(
      STORES.NOTES,
      'readwrite',
      (store) => store.delete(id)
    );
  } catch (error) {
    console.error('Failed to delete offline note:', error);
  }
};

// Pending actions operations for sync
export const addPendingAction = async (action: Omit<PendingAction, 'id' | 'timestamp' | 'synced'>): Promise<void> => {
  try {
    const pendingAction: PendingAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    };
    
    await performTransaction(
      STORES.PENDING_ACTIONS,
      'readwrite',
      (store) => store.add(pendingAction)
    );
  } catch (error) {
    console.error('Failed to add pending action:', error);
  }
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  try {
    return await performTransaction<PendingAction[]>(
      STORES.PENDING_ACTIONS,
      'readonly',
      (store) => store.getAll()
    );
  } catch (error) {
    console.error('Failed to get pending actions:', error);
    return [];
  }
};

export const markActionAsSynced = async (id: string): Promise<void> => {
  try {
    const action = await performTransaction<PendingAction>(
      STORES.PENDING_ACTIONS,
      'readonly',
      (store) => store.get(id)
    );
    
    if (action) {
      await performTransaction(
        STORES.PENDING_ACTIONS,
        'readwrite',
        (store) => store.put({ ...action, synced: true })
      );
    }
  } catch (error) {
    console.error('Failed to mark action as synced:', error);
  }
};

export const deletePendingAction = async (id: string): Promise<void> => {
  try {
    await performTransaction(
      STORES.PENDING_ACTIONS,
      'readwrite',
      (store) => store.delete(id)
    );
  } catch (error) {
    console.error('Failed to delete pending action:', error);
  }
};

// Clear completed/synced actions that are older than a certain time
export const cleanupSyncedActions = async (olderThanMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const cutoffTime = Date.now() - olderThanMs;
    
    for (const action of actions) {
      if (action.synced && action.timestamp < cutoffTime) {
        await deletePendingAction(action.id);
      }
    }
  } catch (error) {
    console.error('Failed to clean up synced actions:', error);
  }
};

// Initialize the database
export const initOfflineStorage = async (): Promise<void> => {
  try {
    await openDB();
    console.log('Offline storage initialized');
  } catch (error) {
    console.error('Failed to initialize offline storage:', error);
  }
};