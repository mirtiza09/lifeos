import { QueryClient, QueryFunction } from "@tanstack/react-query";
import API_URL, { API_PATH_PREFIX } from './apiConfig';

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
    // Build the appropriate URL based on the deployment platform
    let fullUrl;
    
    if (url.startsWith('http')) {
      // External URL, leave as is
      fullUrl = url;
    } else if (url.startsWith('/api/')) {
      // Convert standard API path to platform-specific path
      const path = url.replace(/^\/api\//, '/');
      fullUrl = `${API_PATH_PREFIX}${path}`;
    } else {
      // Standard path construction using base URL
      const baseUrl = (window as any).API_BASE_URL !== undefined ? (window as any).API_BASE_URL : API_URL;
      fullUrl = `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    }
    
    console.log(`Making API request to: ${fullUrl} (method: ${method})`);
    
    const res = await fetch(fullUrl, {
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
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData> => {
  return async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      
      // Build the appropriate URL based on the deployment platform
      let fullUrl;
      
      if (url.startsWith('http')) {
        // External URL, leave as is
        fullUrl = url;
      } else if (url.startsWith('/api/')) {
        // Convert standard API path to platform-specific path
        const path = url.replace(/^\/api\//, '/');
        fullUrl = `${API_PATH_PREFIX}${path}`;
      } else {
        // Standard path construction using base URL
        const baseUrl = (window as any).API_BASE_URL !== undefined ? (window as any).API_BASE_URL : API_URL;
        fullUrl = `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
      }
        
      console.log(`Making API request to: ${fullUrl}`);
      
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (options.on401 === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query function error:', error);
      
      if (error instanceof Response && error.status === 401 && options.on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<unknown>({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Changed to true for better UX
      staleTime: 60000, // 1 minute stale time for better performance
      retry: 1, // Add a single retry for network issues
    },
    mutations: {
      retry: 1, // Add a single retry for network issues
    },
  },
});
