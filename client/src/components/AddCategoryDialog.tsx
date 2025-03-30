import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useNotes } from '@/hooks/use-notes';
import { useToast } from '@/hooks/use-toast';
import { 
  Bookmark, Briefcase, Building, Calendar, Clock, 
  Code, Compass, Database, FileText, Gift, Globe, 
  GraduationCap, HeartHandshake, Home, Laptop, LucideIcon, 
  Map, Megaphone, Music, PenTool, Phone, PieChart, 
  Plane, Puzzle, School, ShoppingBag, Star, Ticket, Zap 
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define schema for category
const categorySchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }).max(30, {
    message: 'Category name must not exceed 30 characters.',
  }).refine(name => /^[a-zA-Z0-9\s-]+$/.test(name), {
    message: 'Category name can only contain letters, numbers, spaces, and hyphens.',
  }),
  icon: z.string().min(1, {
    message: 'Please select an icon for your category.',
  }),
});

// Type for the form values
type CategoryFormValues = z.infer<typeof categorySchema>;

// Props for the dialog component
interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Pre-selected common icons for categories
const commonIcons: { [key: string]: LucideIcon } = {
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Code,
  Compass,
  Database,
  FileText,
  Gift,
  Globe,
  GraduationCap,
  HeartHandshake,
  Home,
  Laptop,
  Map,
  Megaphone,
  Music,
  PenTool,
  Phone,
  PieChart,
  Plane,
  Puzzle,
  School,
  ShoppingBag,
  Star,
  Ticket,
  Zap
};

export default function AddCategoryDialog({ open, onOpenChange }: AddCategoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { saveNote } = useNotes();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      // Convert the category name to a slug for routing
      const categorySlug = values.name.toLowerCase().replace(/\s+/g, '-');
      
      // Create initial note content with metadata to store the selected icon
      const initialContent = `# ${values.name}\n<!-- icon: ${values.icon} -->\n\nAdd your notes here...`;
      
      // Create a new note for this category
      await saveNote(categorySlug, initialContent);
      
      // Close the dialog
      onOpenChange(false);
      
      // Show success message
      toast({
        title: 'Category created',
        description: `${values.name} category has been created successfully.`,
      });
      
      // Navigate to the new category page
      setLocation(`/${categorySlug}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter icon names based on search term
  const filteredIconNames = Object.keys(commonIcons)
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new life category to organize your notes and track your progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <FormLabel>Select Icon</FormLabel>
              <Input 
                placeholder="Search icons..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              
              <ScrollArea className="flex-1 border rounded-md">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2">
                  {filteredIconNames.map(name => {
                    const IconComponent = commonIcons[name];
                    return (
                      <div
                        key={name}
                        className={`flex items-center justify-center p-3 cursor-pointer rounded hover:bg-primary-foreground/10 ${
                          form.watch('icon') === name ? 'bg-primary-foreground/20 ring-1 ring-primary' : ''
                        }`}
                        onClick={() => form.setValue('icon', name, { shouldValidate: true })}
                        title={name}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                    );
                  })}
                  {filteredIconNames.length === 0 && (
                    <p className="col-span-full text-center py-4 text-muted-foreground">
                      No icons found matching "{searchTerm}"
                    </p>
                  )}
                </div>
              </ScrollArea>
              {form.formState.errors.icon && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.icon.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}