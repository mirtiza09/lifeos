import React, { useMemo } from "react";
import { Check, X, Plus, Minus, Settings, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Habit } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import CreateHabitDialog, { HabitFormData } from "./CreateHabitDialog";
import { useSettings } from "@/lib/settingsContext";

interface HabitSectionProps {
  habits: Habit[];
  isLoading: boolean;
  onHabitAction: (id: number, action: 'complete' | 'fail' | 'increment' | 'decrement' | 'reset') => void;
  onAddHabit?: (habit: HabitFormData) => void;
}

export default function HabitSection({ 
  habits, 
  isLoading, 
  onHabitAction,
  onAddHabit 
}: HabitSectionProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { setShowSettingsModal } = useSettings();
  
  const handleCreateHabit = (data: HabitFormData) => {
    if (onAddHabit) {
      onAddHabit(data);
    }
    setDialogOpen(false);
  };

  // Calculate which habits are active today based on client's local time
  const activeHabits = useMemo(() => {
    // Get current client-side day of week
    const today = new Date();
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    // Convert to our format (1 = Monday, 7 = Sunday)
    const formattedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    console.log(`Current local day: ${dayOfWeek}, formatted as: ${formattedDay}`);
    
    return habits.filter(habit => {
      if (habit.repeatType === 'daily') {
        return true;
      } else if (habit.repeatType === 'weekly' && habit.repeatDays) {
        return habit.repeatDays.split(',').includes(formattedDay.toString());
      }
      return false;
    });
  }, [habits]);

  return (
    <div className="border border-border">
      <div className="flex justify-between items-center px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5" />
          <span className="font-medium">Today's Habits</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="h-7 w-7 p-0 rounded-none bg-background"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            className="h-7 w-7 p-0 rounded-none bg-background"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-64 overflow-y-auto scrollbar-hide">
        <table className="w-full">
          <tbody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className={index < 3 ? "border-b border-border" : ""}>
                  <td className="p-4">
                    <Skeleton className="h-4 w-32 bg-muted rounded-none" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Skeleton className="h-6 w-6 rounded-none bg-muted" />
                      <Skeleton className="h-10 w-10 rounded-none bg-muted" />
                      <Skeleton className="h-6 w-6 rounded-none bg-muted" />
                    </div>
                  </td>
                </tr>
              ))
            ) : activeHabits.length > 0 ? (
              // Habits list - only show active habits
              activeHabits.map((habit, index) => (
                <tr key={habit.id} className={index < activeHabits.length - 1 ? "border-b border-border" : ""}>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="font-medium">{habit.name}</span>
                      {habit.repeatType === 'weekly' && (
                        <span className="ml-2 text-xs inline-flex items-center opacity-60">
                          <Calendar className="h-3 w-3 mr-1" />
                          {habit.repeatDays.split(',').length}d
                        </span>
                      )}
                      
                      {/* Status indicators moved next to habit name */}
                      {habit.type === 'boolean' && habit.status && (
                        <span 
                          className={`ml-2 text-xs inline-flex items-center ${
                            habit.status === 'completed' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}
                        >
                          {habit.status === 'completed' ? 'Completed' : 'Failed'}
                        </span>
                      )}
                      
                      {/* Counter value moved next to habit name */}
                      {habit.type === 'counter' && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground inline-flex items-center">
                          {habit.value ?? 0}
                          {habit.maxValue ? 
                            <span className="opacity-60">/{habit.maxValue}</span> 
                          : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {habit.type === 'boolean' ? (
                        // Boolean habit (check/cross)
                        <>
                          <Button
                            variant="outline"
                            className={`h-6 w-6 p-0 rounded-none ${
                              habit.status === 'completed' 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background'
                            }`}
                            onClick={() => onHabitAction(habit.id, habit.status === 'completed' ? 'reset' : 'complete')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className={`h-6 w-6 p-0 rounded-none ${
                              habit.status === 'failed' 
                                ? 'bg-destructive text-destructive-foreground border-destructive' 
                                : 'bg-background'
                            }`}
                            onClick={() => onHabitAction(habit.id, habit.status === 'failed' ? 'reset' : 'fail')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        // Counter habit (plus/minus with value display)
                        <>
                          <Button
                            variant="outline"
                            className="h-6 w-6 p-0 rounded-none bg-background"
                            onClick={() => onHabitAction(habit.id, 'decrement')}
                            disabled={(habit.value ?? 0) <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className={`h-6 w-6 p-0 rounded-none bg-background ${
                              Boolean(habit.maxValue && ((habit.value ?? 0) >= habit.maxValue))
                                ? 'opacity-50' 
                                : ''
                            }`}
                            disabled={Boolean(habit.maxValue && ((habit.value ?? 0) >= habit.maxValue))}
                            onClick={() => onHabitAction(habit.id, 'increment')}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-4 text-center opacity-60">
                  No active habits for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Create Habit Dialog */}
      <CreateHabitDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleCreateHabit} 
      />
    </div>
  );
}
