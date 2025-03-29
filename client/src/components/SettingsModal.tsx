import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/settingsContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Activity, Edit } from 'lucide-react';
import CreateHabitDialog, { HabitFormData } from './CreateHabitDialog';

export default function SettingsModal() {
  const { showSettingsModal, setShowSettingsModal } = useSettings();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [currentHabit, setCurrentHabit] = React.useState<Habit | null>(null);
  const queryClient = useQueryClient();

  // Fetch all habits
  const { data: serverHabits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits']
  });
  
  // Mutation for updating habit
  const updateHabitMutation = useMutation({
    mutationFn: async (data: HabitFormData & { id: number }) => {
      console.log('Updating habit with data:', data);
      const { id, ...habitData } = data;
      try {
        const result = await apiRequest(`/api/habits/${id}`, { 
          method: 'PATCH', 
          data: habitData 
        });
        console.log('Update result:', result);
        return result;
      } catch (error) {
        console.error('Error updating habit:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setEditDialogOpen(false);
      setCurrentHabit(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
    }
  });
  
  // Mutation for deleting habit
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/habits/${id}`, { 
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setEditDialogOpen(false);
      setCurrentHabit(null);
    }
  });
  
  const handleEditHabit = (habit: Habit) => {
    console.log('Editing habit:', habit);
    console.log('Repeat type:', habit.repeatType);
    console.log('Repeat days:', habit.repeatDays);
    setCurrentHabit(habit);
    setEditDialogOpen(true);
  };
  
  const handleUpdateHabit = (data: HabitFormData) => {
    if (currentHabit) {
      updateHabitMutation.mutate({ 
        id: currentHabit.id, 
        ...data 
      });
    }
  };
  
  const handleDeleteHabit = () => {
    if (currentHabit) {
      if (window.confirm(`Are you sure you want to delete "${currentHabit.name}"?`)) {
        deleteHabitMutation.mutate(currentHabit.id);
      }
    }
  };
  
  // Calculate which habits are active today based on client's local time
  const habits = useMemo(() => {
    // Get current client-side day of week
    const today = new Date();
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    // Convert to our format (1 = Monday, 7 = Sunday)
    const formattedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    console.log(`Settings modal - current local day: ${dayOfWeek}, formatted as: ${formattedDay}`);
    
    return serverHabits.map(habit => {
      let isActiveToday = false;
      
      if (habit.repeatType === 'daily') {
        isActiveToday = true;
      } else if (habit.repeatType === 'weekly' && habit.repeatDays) {
        isActiveToday = habit.repeatDays.split(',').includes(formattedDay.toString());
      }
      
      return {
        ...habit,
        isActiveToday
      };
    });
  }, [serverHabits]);

  // Render edit dialog conditionally
  const renderEditDialog = () => {
    if (!currentHabit) return null;
    
    return (
      <CreateHabitDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateHabit}
        defaultValues={{
          name: currentHabit.name,
          type: currentHabit.type,
          maxValue: currentHabit.maxValue || undefined,
          repeatType: currentHabit.repeatType,
          repeatDays: currentHabit.repeatDays,
        }}
        isEditing={true}
        onDelete={handleDeleteHabit}
        title={`Edit "${currentHabit.name}"`}
      />
    );
  };

  return (
    <>
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-sm w-[90vw] p-0 border border-border rounded-none bg-background text-foreground overflow-hidden m-4">
          <DialogHeader className="border-b border-border px-4 py-2">
            <DialogTitle className="text-base font-medium">All Habits</DialogTitle>
          </DialogHeader>
          
          <div className="p-4 overflow-y-auto max-h-[70vh]">
            {/* All Habits Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" />
                <h3 className="font-medium">Manage All Your Habits</h3>
              </div>
              
              <div className="text-xs text-muted-foreground mb-4">
                All your habits are listed below, including those not scheduled for today.
                To change when your day starts, use the settings gear icon in the header.
              </div>
              
              {isLoading ? (
                <div className="text-sm italic opacity-60">Loading habits...</div>
              ) : habits.length === 0 ? (
                <div className="text-sm italic opacity-60">No habits created yet</div>
              ) : (
                <div className="border border-border">
                  <table className="w-full">
                    <tbody>
                      {habits.map((habit, index) => (
                        <tr key={habit.id} className={index < habits.length - 1 ? "border-b border-border" : ""}>
                          <td className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-wrap">
                                <span className="font-medium mr-1">{habit.name}</span>
                                {habit.repeatType === 'weekly' && (
                                  <span className="ml-2 text-xs inline-flex items-center opacity-60">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {habit.repeatDays.split(',').length}d
                                  </span>
                                )}
                                
                                {/* Status indicators */}
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
                                
                                {/* Counter value */}
                                {habit.type === 'counter' && (
                                  <span className="ml-2 font-mono text-xs text-muted-foreground inline-flex items-center">
                                    {habit.value ?? 0}
                                    {habit.maxValue ? 
                                      <span className="opacity-60">/{habit.maxValue}</span> 
                                    : ''}
                                  </span>
                                )}
                                
                                {/* Active indicator */}
                                <span className={`ml-2 text-xs inline-flex items-center ${
                                  habit.isActiveToday === true ? 'text-green-400' : 'text-muted-foreground'
                                }`}>
                                  {habit.isActiveToday === true ? '(Today)' : '(Not Today)'}
                                </span>
                              </div>
                              
                              {/* Edit button */}
                              <Button 
                                variant="ghost" 
                                className="h-6 w-6 p-0 rounded-none"
                                onClick={() => handleEditHabit(habit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="pt-4 text-xs text-muted-foreground mt-4">
              <p>Habit data and task completion will be recorded at your configured day start time.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Habit Dialog */}
      {renderEditDialog()}
    </>
  );
}