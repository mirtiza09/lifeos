import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { clearDeviceId } from '@/lib/pwaUtils';

export default function PasscodeReset() {
  const { toast } = useToast();

  const handleResetPasscode = () => {
    // Clear the device ID and passcode hash from localStorage
    clearDeviceId();
    localStorage.removeItem('passcodeHash');
    
    toast({
      title: "Passcode Reset",
      description: "Authentication data cleared. Refresh the page to set up a new passcode.",
    });
    
    // Reload the page to trigger the passcode setup flow
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Button removed and moved to Header settings
  return null;
}