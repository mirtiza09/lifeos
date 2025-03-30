import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Rocket, Briefcase, User, BarChart, Plus, Bookmark,
  Code, Home, Book, Music, Laptop, Map, Database, Clock,
  FileText, Calendar, Star, School, GraduationCap, Zap,
  Gift, Globe, Compass, Building, ShoppingBag, PieChart
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";

// Create a reusable category component to maintain consistency
const CategoryBox = ({ 
  icon: Icon, 
  label, 
  to 
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string;
}) => (
  <Link href={to} className="block">
    <div className="border border-border aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors p-3">
      <Icon className="w-8 h-8 mb-3 stroke-[1.25] md:w-10 md:h-10" />
      <span className="text-center text-sm md:text-base">{label}</span>
    </div>
  </Link>
);

// Create a component for the inline category creation card
const AddCategoryBox = ({ 
  icons, 
  onCreateCategory 
}: { 
  icons: Record<string, React.ElementType>;
  onCreateCategory: (name: string, icon: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when editing mode is activated
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setName('');
    setSelectedIcon('');
  };
  
  const handleCreate = () => {
    if (name.trim() && selectedIcon) {
      onCreateCategory(name.trim(), selectedIcon);
      setName('');
      setSelectedIcon('');
      setIsEditing(false);
    }
  };
  
  if (!isEditing) {
    // If not in editing mode, show the "Add Category" button
    return (
      <div
        className="border border-dashed border-border aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors p-3"
        onClick={handleStartEditing}
      >
        <Plus className="w-8 h-8 mb-3 stroke-[1.25] md:w-10 md:h-10" />
        <span className="text-center text-sm md:text-base">Add</span>
      </div>
    );
  } else {
    // In editing mode, show the category creation form
    return (
      <div className="border border-dashed border-border aspect-square flex flex-col p-3 overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="w-full p-2 border rounded mb-2 text-sm bg-background text-foreground"
        />
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(icons).map(([iconName, Icon]) => (
              <div
                key={iconName}
                className={`p-1 flex items-center justify-center cursor-pointer rounded hover:bg-muted/20 ${
                  selectedIcon === iconName ? 'ring-1 ring-primary bg-muted/20' : ''
                }`}
                onClick={() => setSelectedIcon(iconName)}
                title={iconName}
              >
                <Icon className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex mt-2 justify-between">
          <button 
            onClick={handleCancel}
            className="px-2 py-1 text-xs border rounded hover:bg-muted/20"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!name.trim() || !selectedIcon}
            className={`px-2 py-1 text-xs border rounded ${
              name.trim() && selectedIcon
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted cursor-not-allowed'
            }`}
          >
            Create
          </button>
        </div>
      </div>
    );
  }
};

export default function LifeCategories() {
  const [customCategories, setCustomCategories] = useState<Array<{category: string, label: string, icon: string}>>([]);
  const { notes, isLoadingNotes, saveNote } = useNotes();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Define icon map for both rendering and selection
  const iconMap: Record<string, React.ElementType> = {
    'Bookmark': Bookmark,
    'Code': Code, 
    'Home': Home,
    'Book': Book,
    'Music': Music,
    'Laptop': Laptop,
    'Map': Map,
    'Database': Database,
    'Clock': Clock,
    'FileText': FileText,
    'Calendar': Calendar,
    'Star': Star,
    'Briefcase': Briefcase,
    'School': School,
    'GraduationCap': GraduationCap,
    'Gift': Gift,
    'Globe': Globe,
    'Compass': Compass,
    'Building': Building,
    'ShoppingBag': ShoppingBag,
    'PieChart': PieChart,
    'Zap': Zap
  };

  // Extract custom categories from notes
  useEffect(() => {
    if (notes && !isLoadingNotes && Array.isArray(notes)) {
      const defaultCategories = ['health', 'career', 'finances', 'personal'];
      
      const custom = notes
        .filter((note: any) => !defaultCategories.includes(note.category) && note.category !== 'analytics')
        .map((note: any) => {
          // Try to extract metadata from the note content to get the icon
          let icon = 'Bookmark'; // Default icon
          try {
            const contentLines = note.content?.split('\n') || [];
            const metadataLine = contentLines.find((line: string) => line.includes('<!-- icon:'));
            if (metadataLine) {
              const iconMatch = metadataLine.match(/icon:\s*([^-\s]+)/);
              if (iconMatch && iconMatch[1]) {
                icon = iconMatch[1];
              }
            }
          } catch (error) {
            console.error('Error extracting icon:', error);
          }
          
          return {
            category: note.category,
            // Convert the slug back to a readable label
            label: note.category
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            icon
          };
        });
      
      setCustomCategories(custom);
    }
  }, [notes, isLoadingNotes]);

  // Handle creating a new category
  const handleCreateCategory = async (name: string, icon: string) => {
    try {
      // Convert the category name to a slug for routing
      const categorySlug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Create initial note content with metadata to store the selected icon
      const initialContent = `# ${name}\n<!-- icon: ${icon} -->\n\nAdd your notes here...`;
      
      // Create a new note for this category
      await saveNote(categorySlug, initialContent);
      
      // Show success message
      toast({
        title: 'Category created',
        description: `${name} category has been created successfully.`,
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

  return (
    <div className="grid gap-4 grid-flow-row grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      <CategoryBox icon={Heart} label="Health" to="/health" />
      <CategoryBox icon={Rocket} label="Career" to="/career" />
      <CategoryBox icon={Briefcase} label="Finances" to="/finances" />
      <CategoryBox icon={User} label="Personal" to="/personal" />
      <CategoryBox icon={BarChart} label="Analytics" to="/analytics" />
      
      {/* Render custom categories */}
      {customCategories.map(({ category, label, icon }) => {
        // Use the specified icon if it exists in our map, otherwise fallback to Bookmark
        const IconComponent = iconMap[icon] || Bookmark;
        
        return (
          <CategoryBox 
            key={category} 
            icon={IconComponent} 
            label={label} 
            to={`/${category}`} 
          />
        );
      })}
      
      {/* Add Category box - inline creation */}
      <AddCategoryBox 
        icons={iconMap}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
}