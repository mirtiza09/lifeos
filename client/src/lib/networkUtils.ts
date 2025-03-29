// Network status detection and management

// Check if we're currently online
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Set up network status listeners
export const setupNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
  return () => {};
};