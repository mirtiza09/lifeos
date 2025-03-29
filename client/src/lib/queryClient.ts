import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { processApiCall } from './syncService';
import { isOnline } from './networkUtils';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    data?: any;
  },
): Promise<any> {
  const method = options?.method || 'GET';
  const data = options?.data;
  try {
    // Determine entity type and ID from URL
    let entity: 'task' | 'habit' | 'setting' | 'note' = 'task';
    let entityId: number | undefined;
    let action: 'create' | 'update' | 'delete' | 'complete' | 'fail' | 'increment' | 'decrement' | undefined;
    
    // Parse URL to determine entity type, ID, and action
    if (url.includes('/api/tasks')) {
      entity = 'task';
      const match = url.match(/\/api\/tasks\/(\d+)/);
      if (match) {
        entityId = parseInt(match[1]);
      }
    } else if (url.includes('/api/habits')) {
      entity = 'habit';
      
      // Check for specific habit actions
      if (url.includes('/complete')) {
        action = 'complete';
      } else if (url.includes('/fail')) {
        action = 'fail';
      } else if (url.includes('/increment')) {
        action = 'increment';
      } else if (url.includes('/decrement')) {
        action = 'decrement';
      }
      
      // Extract habit ID
      const match = url.match(/\/api\/habits\/(\d+)/);
      if (match) {
        entityId = parseInt(match[1]);
      }
    } else if (url.includes('/api/day-start-time')) {
      entity = 'setting';
    } else if (url.includes('/api/notes')) {
      entity = 'note';
      const match = url.match(/\/api\/notes\/(\d+)/);
      if (match) {
        entityId = parseInt(match[1]);
      }
    }
    
    // Determine the basic action type from HTTP method if not already set
    if (!action) {
      if (method === 'POST') action = 'create';
      else if (method === 'PATCH') action = 'update';
      else if (method === 'DELETE') action = 'delete';
    }
    
    if (isOnline()) {
      // If online, try normal fetch first
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(res);
      // Try to parse as JSON if possible, otherwise return the response
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        }
        return res;
      } catch (e) {
        return res;
      }
    } else {
      // If offline, use offline processing
      const result = await processApiCall(
        url,
        method as any,
        entity,
        entityId,
        action,
        data
      );
      
      // Return the result directly
      return result;
    }
  } catch (error) {
    console.error('API request failed:', error);
    // If we encounter any errors, try the offline processing as fallback
    try {
      // Determine entity type and ID from URL
      let entity: 'task' | 'habit' | 'setting' | 'note' = 'task';
      let entityId: number | undefined;
      let action: 'create' | 'update' | 'delete' | 'complete' | 'fail' | 'increment' | 'decrement' | undefined;
      
      // Parse URL to determine entity type and ID
      if (url.includes('/api/tasks')) {
        entity = 'task';
        const match = url.match(/\/api\/tasks\/(\d+)/);
        if (match) {
          entityId = parseInt(match[1]);
        }
      } else if (url.includes('/api/habits')) {
        entity = 'habit';
        
        // Check for specific habit actions
        if (url.includes('/complete')) {
          action = 'complete';
        } else if (url.includes('/fail')) {
          action = 'fail';
        } else if (url.includes('/increment')) {
          action = 'increment';
        } else if (url.includes('/decrement')) {
          action = 'decrement';
        }
        
        // Extract habit ID
        const match = url.match(/\/api\/habits\/(\d+)/);
        if (match) {
          entityId = parseInt(match[1]);
        }
      } else if (url.includes('/api/day-start-time')) {
        entity = 'setting';
      } else if (url.includes('/api/notes')) {
        entity = 'note';
        const match = url.match(/\/api\/notes\/(\d+)/);
        if (match) {
          entityId = parseInt(match[1]);
        }
      }
      
      // Determine the basic action type from HTTP method if not already set
      if (!action) {
        if (method === 'POST') action = 'create';
        else if (method === 'PATCH') action = 'update';
        else if (method === 'DELETE') action = 'delete';
      }
      
      const result = await processApiCall(
        url,
        method as any,
        entity,
        entityId,
        action,
        data
      );
      
      // Return the result directly rather than the response
      return result;
    } catch (fallbackError) {
      // If even the fallback fails, throw the original error
      throw error;
    }
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData> => {
  return async ({ queryKey }) => {
    try {
      // Extract entity type from the query key
      let entity: 'task' | 'habit' | 'setting' | 'note' = 'task';
      const url = queryKey[0] as string;
      
      if (url.includes('/api/tasks')) {
        entity = 'task';
      } else if (url.includes('/api/habits')) {
        entity = 'habit';
      } else if (url.includes('/api/day-start-time')) {
        entity = 'setting';
      } else if (url.includes('/api/notes')) {
        entity = 'note';
      }
      
      // Extract entity ID if present
      let entityId: number | undefined;
      const match = url.match(/\/api\/(tasks|habits|notes)\/(\d+)/);
      if (match) {
        entityId = parseInt(match[2]);
      }
      
      if (isOnline()) {
        // Try online fetch first
        const res = await fetch(url, {
          credentials: "include",
        });
  
        if (options.on401 === "returnNull" && res.status === 401) {
          return null;
        }
  
        await throwIfResNotOk(res);
        return await res.json();
      } else {
        // If offline, use the offline data
        console.log('Loading data from offline storage for', url);
        const offlineData = await processApiCall(
          url,
          'GET',
          entity,
          entityId
        ) as TData;
        
        return offlineData;
      }
    } catch (error) {
      console.error('Query function error:', error);
      
      // If there's any error with the online fetch, try offline data as fallback
      try {
        // Extract entity type from the query key
        let entity: 'task' | 'habit' | 'setting' | 'note' = 'task';
        const url = queryKey[0] as string;
        
        if (url.includes('/api/tasks')) {
          entity = 'task';
        } else if (url.includes('/api/habits')) {
          entity = 'habit';
        } else if (url.includes('/api/day-start-time')) {
          entity = 'setting';
        } else if (url.includes('/api/notes')) {
          entity = 'note';
        }
        
        // Extract entity ID if present
        let entityId: number | undefined;
        const match = url.match(/\/api\/(tasks|habits|notes)\/(\d+)/);
        if (match) {
          entityId = parseInt(match[2]);
        }
        
        console.log('Falling back to offline data for', url);
        const offlineData = await processApiCall(
          url,
          'GET',
          entity,
          entityId
        ) as TData;
        
        return offlineData;
      } catch (fallbackError) {
        // If even the fallback fails, throw the original error
        if (error instanceof Response && error.status === 401 && options.on401 === "returnNull") {
          return null;
        }
        throw error;
      }
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<unknown>({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
