import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Health from "@/pages/Health";
import Career from "@/pages/Career";
import Finances from "@/pages/Finances";
import Personal from "@/pages/Personal";
import { SettingsProvider } from "@/lib/settingsContext";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import { initOfflineStorage } from "@/lib/offlineStorage";
import { startSyncService, stopSyncService } from "@/lib/syncService";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/health" component={Health} />
      <Route path="/career" component={Career} />
      <Route path="/finances" component={Finances} />
      <Route path="/personal" component={Personal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Initialize offline storage and sync service
  useEffect(() => {
    const setupOfflineSupport = async () => {
      try {
        // Initialize IndexedDB storage
        await initOfflineStorage();
        console.log('Offline storage initialized');
        
        // Start sync service (checks every 30 seconds)
        startSyncService(30000);
        console.log('Sync service started');
      } catch (error) {
        console.error('Failed to initialize offline support:', error);
      }
    };
    
    setupOfflineSupport();
    
    // Clean up on unmount
    return () => {
      stopSyncService();
    };
  }, []);
  
  return (
    <>
      <Router />
      <NetworkStatusBar />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
