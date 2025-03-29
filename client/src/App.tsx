import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
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
import { initOfflineStorage } from "@/lib/offlineStorage";
import PasscodeVerification from "@/components/PasscodeVerification";
import PasscodeSetup from "@/components/PasscodeSetup";
import { isNewDevice, hasPasscodeSetup } from "@/lib/pwaUtils";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPasscodeSetup, setNeedsPasscodeSetup] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);

  // Check authentication status and initialize offline storage
  useEffect(() => {
    const setupAppData = async () => {
      try {
        // Initialize IndexedDB storage
        await initOfflineStorage();
        console.log('Offline storage initialized');
        
        // Check if passcode is set up
        const passcodeExists = await hasPasscodeSetup();
        
        if (!passcodeExists) {
          console.log('No passcode set up yet, showing passcode setup');
          setNeedsPasscodeSetup(true);
          setShowPasscodeSetup(true);
        } else if (isNewDevice()) {
          console.log('Passcode exists but device not verified');
          // Passcode exists but this device is not verified
          setIsAuthenticated(false);
        } else {
          console.log('Device already verified');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // If there's an error, fall back to checking device ID directly
        if (!isNewDevice()) {
          setIsAuthenticated(true);
        }
      }
    };
    
    setupAppData();
  }, []);
  
  const handlePasscodeVerified = () => {
    setIsAuthenticated(true);
  };
  
  const handlePasscodeSetup = () => {
    setIsAuthenticated(true);
    setNeedsPasscodeSetup(false);
  };
  
  // Only show the app content if authenticated
  if (!isAuthenticated) {
    return (
      <>
        <PasscodeVerification onVerified={handlePasscodeVerified} />
        <Toaster />
      </>
    );
  }
  
  return (
    <>
      {needsPasscodeSetup && (
        <PasscodeSetup 
          open={showPasscodeSetup} 
          onOpenChange={setShowPasscodeSetup}
          onComplete={handlePasscodeSetup}
        />
      )}
      <Router />
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
