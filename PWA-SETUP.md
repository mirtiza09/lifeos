# Progressive Web App (PWA) Implementation

This document describes how the Life OS application has been converted into a Progressive Web App (PWA).

## What is a PWA?

A Progressive Web App (PWA) is a type of application software delivered through the web, built using common web technologies. It is intended to work on any platform that uses a standards-compliant browser, including both desktop and mobile devices.

## Benefits of PWA

- **Installable**: Users can add the app to their home screen
- **Offline Support**: Works when the network connection is poor or unavailable
- **App-like Experience**: Provides a full-screen experience similar to native apps
- **Automatic Updates**: Always serves the latest version

## Implementation Details

### 1. Manifest File

The `manifest.json` file in the `client/public` directory provides metadata about the application:

```json
{
  "name": "Life OS",
  "short_name": "Life OS",
  "description": "A personal productivity and habit tracking dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### 2. Service Worker

The service worker (`service-worker.js`) enables offline functionality by using a hybrid caching strategy:

- **For Static Assets** (HTML, CSS, JS, images):
  - Uses **Cache First** strategy
  - Checks cache first and returns cached response if available
  - Falls back to network request if item isn't in cache
  - Caches new responses for future use

- **For API Requests** (Dynamic Data):
  - Uses **Network First** strategy
  - Attempts to fetch fresh data from the network first
  - Falls back to cached data only when the network is unavailable
  - Updates cache with fresh data in the background

This hybrid approach ensures optimal performance while keeping dynamic data as fresh as possible.

### 3. Icons

Icons for the PWA were created based on the triangle logo from the application header:
- 192x192 icon for standard usage
- 512x512 icon for high-resolution displays

### 4. HTML Modifications

The `index.html` file was updated to include necessary PWA meta tags:

```html
<meta name="theme-color" content="#000000" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/icons/icon-192x192.svg" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### 5. Service Worker Registration

The service worker is registered in the main application code:

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      });
  });
}
```

### 6. Cache Management and Force Refresh

To address potential caching issues, especially on mobile devices where PWAs can sometimes show outdated data:

- A "Force Refresh Data" button has been added to the settings panel (under the "Data" tab)
- This button triggers a function that communicates with the service worker to clear the API cache
- After clearing the cache, the application reloads to fetch fresh data
- Implementation uses messaging between the application and service worker:
  ```typescript
  // In registerSW.ts
  export function clearAPICache(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        resolve(false);
        return;
      }
      
      // Send message to service worker to clear cache
      navigator.serviceWorker.controller.postMessage({
        action: 'clearAPICache'
      });
      
      // Set up listener for response
      const messageListener = (event) => {
        if (event.data && event.data.action === 'apiCacheCleared') {
          resolve(true);
        }
      };
      
      navigator.serviceWorker.addEventListener('message', messageListener);
    });
  }
  ```

### 7. Docker Integration

The Dockerfile has been updated to include PWA assets in the final build:

```dockerfile
# Copy PWA assets
COPY --from=builder /app/client/public/manifest.json ./dist/manifest.json
COPY --from=builder /app/client/public/service-worker.js ./dist/service-worker.js
COPY --from=builder /app/client/public/icons ./dist/icons
```

## Testing PWA Functionality

To verify the PWA functionality:

1. Open the application in Chrome or another modern browser
2. Open the browser's developer tools
3. Navigate to the "Application" tab
4. Look for the "Manifest" and "Service Workers" sections to confirm they're active
5. Look for the install prompt in the browser's address bar or menu

## Installation Instructions for Users

Users can install the Life OS PWA on their devices by:

1. Visiting the application in a supported browser
2. Clicking the "Add to Home Screen" or "Install" option that appears
   - In Chrome, this appears as a small "+" icon in the address bar
   - In Safari on iOS, it's the "Share" button followed by "Add to Home Screen"
3. Following the on-screen instructions to complete the installation

Once installed, the application will appear on the user's home screen or app launcher and can be launched like any other application.

## Troubleshooting Common PWA Caching Issues

### Issue 1: Outdated Data

**Symptom**: Users see old data even when changes have been made recently.

**Solution**: 
- Use the "Force Refresh Data" button in the Settings menu, under the "Data" tab
- This will clear the API cache and reload fresh data from the server
- For developers: The service worker uses Network First for API requests, but cache may still be used when offline

### Issue 2: App Not Updating

**Symptom**: The application doesn't reflect the latest deployed version.

**Solution**:
- The service worker includes version management and will automatically update
- Hard refresh (Ctrl+F5 on Windows/Linux, Cmd+Shift+R on Mac) can force an update
- In extreme cases, users can clear their browser cache and site data

### Issue 3: Offline Functionality Not Working

**Symptom**: The app doesn't work when offline.

**Solution**:
- Ensure the user has visited enough pages while online to cache essential assets
- Check if the service worker is properly registered (look in browser developer tools)
- Verify that the necessary cache storage permissions are granted

### Issue 4: Mobile-Specific Issues

**Symptom**: PWA behaves differently on mobile devices compared to desktop.

**Solution**:
- iOS Safari has stricter caching rules than Chrome - more frequent force refreshes may be needed
- iOS PWAs run in their own context and have limitations regarding some browser APIs
- Android Chrome should provide a more consistent experience with desktop Chrome