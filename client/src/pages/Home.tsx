import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import TaskSection from "@/components/TaskSection";
import HabitSection from "@/components/HabitSection";
import LifeCategories from "@/components/LifeCategories";
import SettingsModal from "@/components/SettingsModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, Habit } from "@/lib/types";
import { SettingsProvider } from "@/lib/settingsContext";
import { HabitFormData } from "@/components/CreateHabitDialog";

export default function Home() {
  const queryClient = useQueryClient();
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [optimisticHabits, setOptimisticHabits] = useState<Habit[]>([]);

  // Fetch tasks
  const { 
    data: serverTasks = [], 
    isLoading: isTasksLoading,
  } = useQuery<Task[]>({ 
    queryKey: ['/api/tasks'] 
  });

  // Sync server tasks to optimistic tasks when they load
  useEffect(() => {
    if (serverTasks.length > 0) {
      setOptimisticTasks(serverTasks);
    }
  }, [serverTasks]);

  // Fetch habits
  const { 
    data: serverHabits = [], 
    isLoading: isHabitsLoading,
  } = useQuery<Habit[]>({ 
    queryKey: ['/api/habits'] 
  });

  // Sync server habits to optimistic habits when they load
  useEffect(() => {
    if (serverHabits.length > 0) {
      setOptimisticHabits(serverHabits);
    }
  }, [serverHabits]);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      return await apiRequest(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        data: task
      });
    },
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });

      // Save the previous state
      const previousTasks = queryClient.getQueryData(['/api/tasks']);

      // Optimistically update to the new value
      queryClient.setQueryData<Task[]>(['/api/tasks'], (old = []) => {
        return old.map(task => task.id === updatedTask.id ? updatedTask : task);
      });

      // Return a context object with the previous tasks
      return { previousTasks };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousTasks) {
        queryClient.setQueryData(['/api/tasks'], context.previousTasks);
      }
      console.error('Error updating task:', error);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest('/api/tasks', {
        method: 'POST',
        data: {
          text, 
          completed: false,
          createdAt: new Date().toISOString()
        }
      });
    },
    onMutate: async (newTaskText) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });
      
      // Create a temporary optimistic task with a temporary negative ID
      // Real ID will be assigned by the server
      const tempId = -Date.now(); // Use negative timestamp to ensure uniqueness
      const createdAt = new Date().toISOString();
      const newTask: Task = {
        id: tempId,
        text: newTaskText,
        completed: false,
        createdAt
      };
      
      // Add to optimistic tasks
      setOptimisticTasks(current => [...current, newTask]);
      
      return { newTask };
    },
    onSuccess: (data) => {
      // Replace the temp task with the real one returned from server
      setOptimisticTasks(current => 
        current.map(task => 
          task.id < 0 ? data : task
        )
      );
      
      // Refresh the task list
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (_, __, context) => {
      // Remove the temp task on error
      if (context?.newTask) {
        setOptimisticTasks(current => 
          current.filter(task => task.id !== context.newTask.id)
        );
      }
      console.error('Error creating task');
    }
  });
  
  // Add a new task
  const addTask = (text: string) => {
    if (text.trim()) {
      createTaskMutation.mutate(text.trim());
    }
  };

  // Toggle task completion with optimistic updates
  const toggleTask = (id: number) => {
    const task = optimisticTasks.find(t => t.id === id);
    if (task) {
      // Immediately update local state for a responsive UI
      const updatedTask = { ...task, completed: !task.completed };
      setOptimisticTasks(current => 
        current.map(t => t.id === id ? updatedTask : t)
      );
      
      // Also trigger the mutation to update the server
      updateTaskMutation.mutate(updatedTask);
    }
  };

  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async (habit: { id: number, action: 'complete' | 'fail' | 'increment' | 'decrement' | 'reset' }) => {
      return await apiRequest(`/api/habits/${habit.id}/${habit.action}`, {
        method: 'PATCH',
        data: {}
      });
    },
    onMutate: async (updatedHabit) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/habits'] });

      // Save the previous state
      const previousHabits = queryClient.getQueryData(['/api/habits']);

      // Apply optimistic update based on the action
      queryClient.setQueryData<Habit[]>(['/api/habits'], (old = []) => {
        return old.map(habit => {
          if (habit.id !== updatedHabit.id) return habit;
          
          const newHabit = { ...habit };
          if (updatedHabit.action === 'complete') newHabit.status = 'completed';
          else if (updatedHabit.action === 'fail') newHabit.status = 'failed';
          else if (updatedHabit.action === 'reset') newHabit.status = undefined;
          else if (updatedHabit.action === 'increment') newHabit.value = (habit.value || 0) + 1;
          else if (updatedHabit.action === 'decrement') newHabit.value = Math.max(0, (habit.value || 0) - 1);
          
          return newHabit;
        });
      });

      return { previousHabits };
    },
    onError: (error, variables, context) => {
      // Roll back to previous state on error
      if (context?.previousHabits) {
        queryClient.setQueryData(['/api/habits'], context.previousHabits);
      }
      console.error('Error updating habit:', error);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    }
  });

  // Handle habit actions with optimistic updates
  const handleHabitAction = (id: number, action: 'complete' | 'fail' | 'increment' | 'decrement' | 'reset') => {
    const habit = optimisticHabits.find(h => h.id === id);
    if (habit) {
      // Create an updated habit based on the action
      let updatedHabit = { ...habit };
      
      if (action === 'complete') updatedHabit.status = 'completed';
      else if (action === 'fail') updatedHabit.status = 'failed';
      else if (action === 'reset') updatedHabit.status = undefined;
      else if (action === 'increment') updatedHabit.value = (habit.value || 0) + 1;
      else if (action === 'decrement') updatedHabit.value = Math.max(0, (habit.value || 0) - 1);
      
      // Immediately update local state for a responsive UI
      setOptimisticHabits(current => 
        current.map(h => h.id === id ? updatedHabit : h)
      );
      
      // Also trigger the mutation to update the server
      updateHabitMutation.mutate({ id, action });
    }
  };
  
  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (habitData: HabitFormData) => {
      return await apiRequest('/api/habits', {
        method: 'POST',
        data: {
          name: habitData.name,
          type: habitData.type,
          value: habitData.type === 'counter' ? 0 : undefined,
          maxValue: habitData.maxValue,
          repeatType: habitData.repeatType,
          repeatDays: habitData.repeatDays,
          lastReset: new Date().toISOString()
        }
      });
    },
    onMutate: async (newHabitData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/habits'] });
      
      // Create a temporary optimistic habit with a temporary negative ID
      const tempId = -Date.now(); 
      const newHabit: Habit = {
        id: tempId,
        name: newHabitData.name,
        type: newHabitData.type,
        value: newHabitData.type === 'counter' ? 0 : undefined,
        maxValue: newHabitData.maxValue,
        repeatType: newHabitData.repeatType,
        repeatDays: newHabitData.repeatDays,
        lastReset: new Date().toISOString(),
        isActiveToday: true // Assume it's active today since we're creating it now
      };
      
      // Add to optimistic habits
      setOptimisticHabits(current => [...current, newHabit]);
      
      return { newHabit };
    },
    onSuccess: (data) => {
      // Replace the temp habit with the real one returned from server
      setOptimisticHabits(current => 
        current.map(habit => 
          habit.id < 0 ? data : habit
        )
      );
      
      // Refresh the habit list
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    },
    onError: (_, __, context) => {
      // Remove the temp habit on error
      if (context?.newHabit) {
        setOptimisticHabits(current => 
          current.filter(habit => habit.id !== context.newHabit.id)
        );
      }
      console.error('Error creating habit');
    }
  });
  
  // Add a new habit
  const addHabit = (habitData: HabitFormData) => {
    createHabitMutation.mutate(habitData);
  };

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background text-foreground font-mono">
        <Header />
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          <div className="lg:col-span-2 space-y-8">
            <TaskSection 
              tasks={optimisticTasks} 
              isLoading={isTasksLoading && optimisticTasks.length === 0} 
              onToggleTask={toggleTask}
              onAddTask={addTask}
            />
            
            <HabitSection 
              habits={optimisticHabits} 
              isLoading={isHabitsLoading && optimisticHabits.length === 0} 
              onHabitAction={handleHabitAction}
              onAddHabit={addHabit}
            />
          </div>
          
          <LifeCategories />
        </main>
        
        {/* Settings Modal */}
        <SettingsModal />
      </div>
    </SettingsProvider>
  );
}
