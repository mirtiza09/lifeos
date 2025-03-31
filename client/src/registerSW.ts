// Service Worker Registration and Management
let swRegistration: ServiceWorkerRegistration | null = null;

// Register the service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          swRegistration = registration;
          
          // Listen for messages from the service worker
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.action === 'apiCacheCleared') {
              console.log('API cache was cleared at:', event.data.timestamp);
              // You could trigger a UI notification here
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Force refresh the API cache
export function clearAPICache(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      console.warn('Service worker is not controlling the page yet');
      resolve(false);
      return;
    }

    // Set up a timeout
    const timeoutId = setTimeout(() => {
      reject(new Error('Clearing cache timed out'));
    }, 3000);

    // Set up a one-time message listener for the response
    const messageListener = (event: MessageEvent) => {
      if (event.data && event.data.action === 'apiCacheCleared') {
        clearTimeout(timeoutId);
        navigator.serviceWorker.removeEventListener('message', messageListener);
        resolve(true);
      }
    };

    // Listen for the response
    navigator.serviceWorker.addEventListener('message', messageListener);

    // Send the clear cache message
    navigator.serviceWorker.controller.postMessage({
      action: 'clearAPICache'
    });
  });
}

// Update the service worker if needed
export function updateServiceWorker() {
  if (swRegistration) {
    swRegistration.update().catch(error => {
      console.error('Service worker update failed:', error);
    });
  }
}