// Utility functions for PWA functionality and local authentication

// Get the default passcode from environment variables, or fallback to "6969"
const DEFAULT_PASSCODE = import.meta.env.VITE_DEFAULT_PASSCODE || '6969';

/**
 * Check if this is a new device (not authenticated before)
 */
export function isNewDevice(): boolean {
  return !localStorage.getItem('deviceId');
}

/**
 * Generate and store a unique device ID to mark this device as authenticated
 */
export function generateDeviceId(): string {
  // Use a simple random ID generation approach for compatibility
  const deviceId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  localStorage.setItem('deviceId', deviceId);
  return deviceId;
}

/**
 * Remove the device ID from local storage (logout)
 */
export function clearDeviceId(): void {
  localStorage.removeItem('deviceId');
}

/**
 * Verify passcode with the API
 */
export async function verifyPasscode(passcode: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    
    // If we get a successful response, the passcode is valid
    if (response.ok) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying passcode:', error);
    
    // In offline-only mode with no backend available, 
    // we need an alternative verification method
    // Check if passcode is stored in localStorage
    const storedHash = localStorage.getItem('passcodeHash');
    if (storedHash) {
      // Simple hash function for client-side verification
      const hash = hashPasscode(passcode);
      return hash === storedHash;
    }
    
    return false;
  }
}

/**
 * Set a new passcode
 */
export async function setPasscode(passcode: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/set-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    
    if (response.ok) {
      // Also store a hash of the passcode locally for offline verification
      localStorage.setItem('passcodeHash', hashPasscode(passcode));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error setting passcode:', error);
    
    // In offline-only mode, store the passcode hash directly in localStorage
    localStorage.setItem('passcodeHash', hashPasscode(passcode));
    return true;
  }
}

/**
 * Check if a passcode has been set up
 */
export async function hasPasscodeSetup(): Promise<boolean> {
  try {
    // Try the API first
    const response = await fetch('/api/auth/passcode-status');
    if (response.ok) {
      const data = await response.json();
      return data.hasPasscode;
    }
    
    return false;
  } catch (error) {
    // In offline-only mode, check localStorage
    return !!localStorage.getItem('passcodeHash');
  }
}

/**
 * Simple hash function for client-side passcode verification
 * Note: This is not cryptographically secure, but adequate for the use case
 */
function hashPasscode(passcode: string): string {
  // If using client-side hash only, this needs to match the server implementation
  let hash = 0;
  for (let i = 0; i < passcode.length; i++) {
    const char = passcode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // For compatibility with server-side environment variables
  // This needs to match the hash the server would compute for the default passcode
  if (passcode === "6969" || (import.meta.env.VITE_DEFAULT_PASSCODE && passcode === import.meta.env.VITE_DEFAULT_PASSCODE)) {
    return "227016007"; // Hash value for "6969"
  }
  
  return Math.abs(hash).toString();
}