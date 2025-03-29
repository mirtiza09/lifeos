import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => void;
  defaultValues?: HabitFormData;
  isEditing?: boolean;
  onDelete?: () => void;
  title?: string;
}

export interface HabitFormData {
  name: string;
  type: 'boolean' | 'counter';
  maxValue?: number;
  repeatType: 'daily' | 'weekly';
  repeatDays: string;
}

const habitFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['boolean', 'counter'], {
    required_error: 'Please select a habit type',
  }),
  maxValue: z
    .number()
    .positive()
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: 'Max value must be greater than 0',
    }),
  repeatType: z.enum(['daily', 'weekly'], {
    required_error: 'Please select a repeat type',
  }),
  repeatDays: z.string(),
});

export default function CreateHabitDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  defaultValues,
  isEditing = false,
  onDelete,
  title = "Create Habit"
}: CreateHabitDialogProps) {
  // Log the defaultValues being passed for debugging
  console.log('Default values received:', defaultValues);
  
  // Initialize selected days based on default values
  const initialDays = defaultValues?.repeatType === 'weekly' && defaultValues?.repeatDays 
    ? defaultValues.repeatDays.split(',')
    : ['1', '2', '3', '4', '5', '6', '7'];
  
  console.log('Initial days:', initialDays);
  console.log('Repeat type from defaultValues:', defaultValues?.repeatType);
    
  const [selectedDays, setSelectedDays] = React.useState<string[]>(initialDays);

  // Create form with correct defaults
  const form = useForm<z.infer<typeof habitFormSchema>>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: defaultValues || {
      name: '',
      type: 'boolean',
      repeatType: 'daily',
      repeatDays: '1,2,3,4,5,6,7',
    },
  });

  // Watch form values
  const habitType = form.watch('type');
  const repeatType = form.watch('repeatType');
  
  // Reset form when default values change
  React.useEffect(() => {
    if (defaultValues) {
      console.log('Resetting form with values:', defaultValues);
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // Function to handle form submission
  const handleSubmit: SubmitHandler<z.infer<typeof habitFormSchema>> = (values) => {
    // Update repeatDays based on selected checkboxes for weekly habits
    if (values.repeatType === 'weekly') {
      // Ensure we have at least one day selected
      if (selectedDays.length === 0) {
        console.error('No days selected for weekly habit');
        return;
      }
      
      // Sort the days in ascending order for consistency
      const sortedDays = [...selectedDays].sort((a, b) => parseInt(a) - parseInt(b));
      values.repeatDays = sortedDays.join(',');
      
      console.log('Submitting weekly habit with days:', values.repeatDays);
    } else {
      values.repeatDays = '1,2,3,4,5,6,7';
      console.log('Submitting daily habit with all days');
    }

    // Pass the data to the parent component
    console.log('Final form data being submitted:', values);
    onSubmit(values);
    
    // Only reset form if not editing (for new habits)
    if (!isEditing) {
      form.reset();
      setSelectedDays(['1', '2', '3', '4', '5', '6', '7']);
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Update selected days when repeat type changes
  React.useEffect(() => {
    console.log('Repeat type changed:', repeatType);
    if (repeatType === 'daily') {
      setSelectedDays(['1', '2', '3', '4', '5', '6', '7']);
    } else if (repeatType === 'weekly' && defaultValues?.repeatDays && isEditing) {
      // When editing a weekly habit, use the days from the default values
      setSelectedDays(defaultValues.repeatDays.split(','));
      console.log('Setting weekly days from defaults:', defaultValues.repeatDays.split(','));
    }
  }, [repeatType, defaultValues, isEditing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 border border-border rounded-none bg-background text-foreground overflow-hidden">
        <DialogHeader className="border-b border-border px-4 py-2">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Habit name" className="rounded-none border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Label className="block mb-2">Type:</Label>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value="boolean" id="boolean" className="rounded-none" />
                        <Label htmlFor="boolean" className="ml-2">Yes/No</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="counter" id="counter" className="rounded-none" />
                        <Label htmlFor="counter" className="ml-2">Counted</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {habitType === 'counter' && (
              <FormField
                control={form.control}
                name="maxValue"
                render={({ field }) => (
                  <FormItem>
                    <Label>Target:</Label>
                    <FormControl>
                      <Input
                        type="number"
                        className="rounded-none border-border w-20"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="repeatType"
              render={({ field }) => (
                <FormItem>
                  <Label className="block mb-2">Repeats:</Label>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value="daily" id="daily" className="rounded-none" />
                        <Label htmlFor="daily" className="ml-2">Daily</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="weekly" id="weekly" className="rounded-none" />
                        <Label htmlFor="weekly" className="ml-2">Weekly</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {repeatType === 'weekly' && (
              <div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { value: '1', label: 'M' },
                    { value: '2', label: 'T' },
                    { value: '3', label: 'W' },
                    { value: '4', label: 'T' },
                    { value: '5', label: 'F' },
                    { value: '6', label: 'S' },
                    { value: '7', label: 'S' },
                  ].map((day) => (
                    <div key={day.value} className="flex items-center">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                        className="rounded-none"
                      />
                      <Label htmlFor={`day-${day.value}`} className="ml-1">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <span className="text-sm text-red-500 block mt-1">Select at least one day</span>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border mt-4 flex items-center justify-between">
              <div>
                {isEditing && onDelete && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={onDelete}
                    className="rounded-none bg-background text-destructive border-destructive"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                type="submit"
                disabled={repeatType === 'weekly' && selectedDays.length === 0}
                className="rounded-none bg-background"
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}