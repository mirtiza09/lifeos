import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';
import { generateDeviceId, setPasscode as setPasscodeUtil } from '@/lib/pwaUtils';

interface PasscodeSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function PasscodeSetup({ open, onOpenChange, onComplete }: PasscodeSetupProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isSetting, setIsSetting] = useState(false);
  const { toast } = useToast();

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'passcode' | 'confirm') => {
    // Ensure only numbers and limit to 4 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (field === 'passcode') {
      setPasscode(value);
    } else {
      setConfirmPasscode(value);
    }
  };

  const setNewPasscode = async () => {
    if (passcode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Passcode must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    if (passcode !== confirmPasscode) {
      toast({
        title: "Passcodes Don't Match",
        description: "The passcodes you entered don't match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSetting(true);
    try {
      // Use our utility function that handles both online and offline passcode setting
      const success = await setPasscodeUtil(passcode);

      if (success) {
        // Generate and store device ID since this is the device that set the passcode
        generateDeviceId();
        localStorage.setItem('deviceVerifiedAt', new Date().toISOString());
        
        toast({
          title: "Passcode Set",
          description: "Your passcode has been set successfully.",
        });
        
        onOpenChange(false);
        onComplete();
      } else {
        toast({
          title: "Error",
          description: "Failed to set passcode. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error setting passcode:', error);
      toast({
        title: "Error",
        description: "An error occurred while setting your passcode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[90vw] p-0 border border-border rounded-md bg-background text-foreground overflow-hidden max-h-full">
        <DialogHeader className="p-6 text-center">
          <KeyRound className="w-12 h-12 mx-auto mb-4 text-primary" />
          <DialogTitle className="text-xl font-semibold">Set Your Passcode</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-0 space-y-4">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Create a 4-digit passcode to secure your Life OS. You'll need this passcode when accessing from a new device.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="passcode" className="text-sm font-medium block mb-1">
                New Passcode
              </label>
              <Input
                id="passcode"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter 4-digit passcode"
                value={passcode}
                onChange={(e) => handlePasscodeChange(e, 'passcode')}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="confirmPasscode" className="text-sm font-medium block mb-1">
                Confirm Passcode
              </label>
              <Input
                id="confirmPasscode"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Confirm 4-digit passcode"
                value={confirmPasscode}
                onChange={(e) => handlePasscodeChange(e, 'confirm')}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              onClick={setNewPasscode}
              disabled={passcode.length !== 4 || confirmPasscode.length !== 4 || isSetting}
              className="w-full"
            >
              {isSetting ? 'Setting Passcode...' : 'Set Passcode'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}