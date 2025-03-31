import { useState, useEffect } from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NetworkStatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      // Show reconnected message briefly
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't show anything if online and offline message not needed
  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-2 px-4 rounded-none border-t transition-all duration-300 ${
        isOnline ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800"
      }`}
    >
      {isOnline ? (
        <>
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            You're back online! Syncing your data...
          </AlertDescription>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertDescription>
            You're offline. Some features may be limited.
          </AlertDescription>
        </>
      )}
    </Alert>
  );
}