import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, InfoIcon } from 'lucide-react';
import { 
  generateDeviceId, 
  isNewDevice, 
  verifyPasscode as verifyPasscodeUtil 
} from '@/lib/pwaUtils';

interface PasscodeVerificationProps {
  onVerified: () => void;
}

export default function PasscodeVerification({ onVerified }: PasscodeVerificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  // Check if this is a new device on component mount
  useEffect(() => {
    if (isNewDevice()) {
      setIsOpen(true);
    } else {
      // Device already verified
      onVerified();
    }
  }, [onVerified]);

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure only numbers and limit to 4 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPasscode(value);
  };

  const verifyPasscode = async () => {
    if (passcode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Please enter all 4 digits of your passcode.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Use our utility function that handles both online and offline verification
      const isValid = await verifyPasscodeUtil(passcode);

      if (isValid) {
        // Generate and store device ID
        generateDeviceId();
        
        // Also store a timestamp of when this device was verified
        localStorage.setItem('deviceVerifiedAt', new Date().toISOString());
        
        toast({
          title: "Access Granted",
          description: "Your device has been verified.",
        });
        
        setIsOpen(false);
        onVerified();
      } else {
        setAttempts(prev => prev + 1);
        toast({
          title: "Invalid Passcode",
          description: `Incorrect passcode. Please try again. (${attempts + 1} attempts)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying passcode:', error);
      toast({
        title: "Verification Error",
        description: "Could not verify your passcode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setPasscode('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPasscode();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent className="sm:max-w-md w-[90vw] p-0 border border-border rounded-md bg-background text-foreground overflow-hidden max-h-full">
        <DialogHeader className="p-6 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
          <DialogTitle className="text-xl font-semibold">Enter Passcode</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-0 space-y-4">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Please enter your 4-digit passcode to access the application.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mx-auto bg-muted p-2 rounded-md">
            <InfoIcon className="w-4 h-4" />
            <span>Default passcode is <code className="bg-background px-1 rounded">6969</code></span>
          </div>
          
          <div className="space-y-4 mt-4">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="Enter 4-digit passcode"
              value={passcode}
              onChange={handlePasscodeChange}
              onKeyDown={handleKeyDown}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
            
            <Button 
              onClick={verifyPasscode}
              disabled={passcode.length !== 4 || isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify Passcode'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}