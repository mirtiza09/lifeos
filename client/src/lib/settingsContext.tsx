import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface SettingsContextType {
  dayStartTime: string;
  setDayStartTime: (time: string) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  isLoadingSettings: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const defaultSettings: SettingsContextType = {
  dayStartTime: '04:00', // Default to 4 AM
  setDayStartTime: () => {},
  showSettingsModal: false,
  setShowSettingsModal: () => {},
  isLoadingSettings: false,
  theme: 'dark',
  setTheme: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [dayStartTime, setLocalDayStartTime] = useState<string>(defaultSettings.dayStartTime);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [theme, setLocalTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' ? 'light' : 'dark') as 'dark' | 'light';
  });
  const { toast } = useToast();

  // Load day start time from the server when the component mounts
  useEffect(() => {
    const fetchDayStartTime = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await fetch('/api/day-start-time');
        
        if (response.ok) {
          const data = await response.json();
          setLocalDayStartTime(data.dayStartTime);
          // Also save to localStorage as a fallback
          localStorage.setItem('dayStartTime', data.dayStartTime);
        } else {
          // If server request fails, try to get from localStorage
          const savedTime = localStorage.getItem('dayStartTime');
          if (savedTime) {
            setLocalDayStartTime(savedTime);
          }
        }
      } catch (error) {
        console.error('Error fetching day start time:', error);
        // Try to get from localStorage if API call fails
        const savedTime = localStorage.getItem('dayStartTime');
        if (savedTime) {
          setLocalDayStartTime(savedTime);
        }
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchDayStartTime();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to update the day start time
  const setDayStartTime = async (newTime: string) => {
    try {
      setIsLoadingSettings(true);
      
      // Send the new time to the server
      const response = await fetch('/api/day-start-time', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: newTime }),
      });
      
      if (response.ok) {
        // Update the local state
        setLocalDayStartTime(newTime);
        
        // Save to localStorage as a fallback
        localStorage.setItem('dayStartTime', newTime);
        
        toast({
          title: 'Settings Updated',
          description: 'Day start time has been updated.',
        });
        
        // Trigger daily data logging at this point (optional)
        try {
          await fetch('/api/log-daily-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
        } catch (error) {
          console.error('Error logging daily data after time change:', error);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to update day start time.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating day start time:', error);
      toast({
        title: 'Error',
        description: 'There was a problem connecting to the server.',
        variant: 'destructive',
      });
      
      // Set it locally even if the server request fails
      setLocalDayStartTime(newTime);
      localStorage.setItem('dayStartTime', newTime);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Function to set theme
  const setTheme = (newTheme: 'dark' | 'light') => {
    setLocalTheme(newTheme);
    
    toast({
      title: 'Theme Updated',
      description: `Switched to ${newTheme} mode.`,
    });
  };

  const value = {
    dayStartTime,
    setDayStartTime,
    showSettingsModal,
    setShowSettingsModal,
    isLoadingSettings,
    theme,
    setTheme
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};