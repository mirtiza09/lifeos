import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Settings,
  Loader2,
  RotateCcw,
  AlertCircle,
  Clock,
  Database,
  FileJson,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/settingsContext";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { dayStartTime, setDayStartTime, theme, setTheme, isLoadingSettings } =
    useSettings();
  const [timeInput, setTimeInput] = useState(dayStartTime);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Update the date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update the input when context changes
  useEffect(() => {
    setTimeInput(dayStartTime);
  }, [dayStartTime]);

  // Format date as "It's {weekday}, the {date} of {Month}, {year}."
  const formattedDate = format(currentDate, "EEEE, 'the' do 'of' MMMM, yyyy");

  const handleSaveTime = () => {
    setDayStartTime(timeInput);
    // We'll keep the dialog open if we're waiting for the API
    if (!isLoadingSettings) {
      setSettingsOpen(false);
    }
  };

  const handleResetHabits = async () => {
    try {
      setIsResetting(true);

      const response = await fetch("/api/reset-habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Habits Reset",
          description: "All habits have been reset successfully.",
        });

        // Force refresh habit data
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to reset habits.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting habits:", error);
      toast({
        title: "Error",
        description: "There was a problem connecting to the server.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <header className="flex flex-col p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 19.5H22L12 2Z" />
              </svg>
            </div>
            <h1 className="text-xl tracking-wide">Life OS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              title="Settings"
              onClick={() => setSettingsOpen(true)}
              className="rounded-none"
              disabled={isLoadingSettings || isResetting}
            >
              {isLoadingSettings || isResetting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Settings className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-gray-400 italic mt-4">
          <span>
            Hi <span className="inline-flex items-center">👋</span>, It's{" "}
            {formattedDate}.
          </span>
        </div>
      </header>

      {/* Settings Dialog with Tabs */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[350px] p-0 border border-border rounded-none overflow-hidden">
          <DialogHeader className="border-b border-border px-4 py-2">
            <DialogTitle className="text-base font-medium">
              Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none h-12 bg-transparent p-0">
              <TabsTrigger value="appearance" className="rounded-none data-[state=active]:bg-accent/50 border-x border-border">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="day-start" className="rounded-none data-[state=active]:bg-accent/50 border-r border-border">
                Day Start
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="rounded-none data-[state=active]:bg-accent/50 border-r border-border">
                Data
              </TabsTrigger>
            </TabsList>

            <div className="h-[250px] overflow-y-auto">
              {/* Appearance Tab */}
              <TabsContent value="appearance" className="p-4 h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4" />
                      <Label htmlFor="theme-toggle">Dark Mode</Label>
                    </div>
                    <Switch
                      id="theme-toggle"
                      checked={theme === "dark"}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                      }
                    />
                  </div>
                </div>
              </TabsContent>
  
              {/* Day Start Time Tab */}
              <TabsContent value="day-start" className="p-4 h-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <Label htmlFor="dayStartTime">Day Start Time</Label>
                    </div>
                    <Input
                      id="dayStartTime"
                      type="time"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="w-32 rounded-none border-border"
                      disabled={isLoadingSettings}
                    />
                    <div className="text-xs text-muted-foreground">
                      Habits will reset at this time. Task and habit data logs are
                      saved daily.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSaveTime}
                    className="rounded-none mt-4"
                    disabled={isLoadingSettings}
                  >
                    {isLoadingSettings ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Time"
                    )}
                  </Button>
                </div>
              </TabsContent>
  
              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="p-4 h-full">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <RotateCcw className="w-4 h-4" />
                      <h3 className="font-medium">Reset Habits</h3>
                    </div>
  
                    <div className="text-xs text-muted-foreground mb-3">
                      Reset counters to 0 and clear all statuses. Current data
                      will be saved for reports.
                    </div>
  
                    <Button
                      variant="destructive"
                      onClick={handleResetHabits}
                      className="rounded-none mt-1 w-full"
                      disabled={isResetting}
                      size="sm"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset All Habits"
                      )}
                    </Button>
                  </div>
  
                  <Separator className="my-3" />
  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileJson className="w-4 h-4" />
                      <h3 className="font-medium">Log Files</h3>
                    </div>
  
                    <div className="text-xs text-muted-foreground">
                      Daily logs stored in:
                      <code className="bg-muted p-1 mt-1 text-xs block overflow-auto">
                        ./data/logs/daily/YYYY-MM-DD/
                      </code>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
