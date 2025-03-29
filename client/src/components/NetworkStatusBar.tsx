import React, { useState, useEffect } from 'react';
import { isOnline, setupNetworkListeners } from '@/lib/networkUtils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { syncWithServer } from '@/lib/syncService';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export default function NetworkStatusBar() {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { toast } = useToast();

  // Update online status when network changes
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast({
        title: 'Online',
        description: 'You are back online. Syncing changes...',
      });
      syncData();
    };

    const handleOffline = () => {
      setOnline(false);
      toast({
        title: 'Offline',
        description: 'You are now offline. Changes will be saved locally.',
        variant: 'destructive',
      });
    };

    const cleanup = setupNetworkListeners(handleOnline, handleOffline);

    // Initial check
    setOnline(isOnline());

    return cleanup;
  }, [toast]);

  // Sync data when coming back online
  const syncData = async () => {
    if (!online) return;

    setSyncing(true);
    try {
      await syncWithServer();
      setToastMessage('All changes synced successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error syncing data:', error);
      setToastMessage('Error syncing some changes. Will retry later.');
      setShowToast(true);
    } finally {
      setSyncing(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!online) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-3 py-2 rounded-md flex items-center shadow-md z-50">
        <WifiOff className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-2 rounded-md flex items-center shadow-md z-50">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm font-medium">Syncing...</span>
      </div>
    );
  }

  // Don't render anything when online and not syncing
  return null;
}