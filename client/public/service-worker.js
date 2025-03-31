// Service Worker for Life OS PWA

const CACHE_VERSION = 'v2';
const STATIC_CACHE_NAME = `life-os-static-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `life-os-api-cache-${CACHE_VERSION}`;

const STATIC_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Opened static cache');
        return cache.addAll(STATIC_URLS_TO_CACHE);
      })
  );
});

// Message listener for force refresh
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'clearAPICache') {
    event.waitUntil(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.keys().then(keys => {
          return Promise.all(keys.map(request => cache.delete(request)));
        }).then(() => {
          console.log('API cache cleared');
          // Inform the client that the cache was cleared
          if (event.source) {
            event.source.postMessage({ 
              action: 'apiCacheCleared', 
              timestamp: new Date().toISOString() 
            });
          }
        });
      })
    );
  }
});

// Hybrid caching strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Network First for API requests
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the latest version in the background with a shorter TTL
          caches.open(API_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try the cache as fallback
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If nothing in cache either, return an offline message
              if (event.request.headers.get('accept').includes('application/json')) {
                return new Response(JSON.stringify({
                  error: true,
                  message: 'You are currently offline and no cached data is available.'
                }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              // For non-JSON responses, redirect to offline page or return simple message
              return new Response('You are currently offline.', {
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
  } else {
    // Cache First for static assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
});

// Update the service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients so they use this service worker immediately
      return self.clients.claim();
    })
  );
});