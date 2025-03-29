import React, { useState, useEffect } from 'react';
import { useNotes } from '@/hooks/use-notes';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader, Edit, Save, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface CategoryNotesProps {
  category: 'health' | 'career' | 'finances' | 'personal';
  title?: string;
}

const CategoryNotes: React.FC<CategoryNotesProps> = ({ 
  category
}) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { useNoteByCategory, saveNote, isUpdating, isCreating } = useNotes();
  const { data: noteData, isLoading } = useNoteByCategory(category);
  const { toast } = useToast();
  
  // When note data is loaded, update the content
  useEffect(() => {
    if (noteData) {
      setContent(noteData.content);
    } else {
      setContent('');
    }
  }, [noteData]);
  
  // Reset save status after 2 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);
  
  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      await saveNote(category, content);
      setSaveStatus('saved');
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Your notes have been saved successfully."
      });
    } catch (error) {
      setSaveStatus('idle');
      toast({
        title: "Error saving",
        description: "There was a problem saving your notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDiscard = () => {
    if (noteData) {
      setContent(noteData.content);
    } else {
      setContent('');
    }
    setIsEditing(false);
  };

  const isSaving = isUpdating || isCreating || saveStatus === 'saving';

  // Only render a container when in editing mode
  if (!isEditing) {
    return (
      <div className="w-full mb-4">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Edit</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : noteData && noteData.content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownEditor
              content={content}
              onChange={setContent}
              readOnly={true}
              minHeight="auto"
            />
          </div>
        ) : (
          <p className="text-muted-foreground">No notes yet. Click 'Edit' to add some.</p>
        )}
      </div>
    );
  }

  // Render the edit container when in editing mode
  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4 flex-wrap gap-2">
        <div className="ml-auto flex flex-row space-x-2">
          <Button variant="outline" onClick={handleDiscard} disabled={isSaving} size="sm">
            <X className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:inline">Discard</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <>
                <Loader className="mr-1 sm:mr-2 h-4 w-4 animate-spin" />
                <span className="sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="sm:inline">Save</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <MarkdownEditor
          content={content}
          onChange={setContent}
          readOnly={false}
          minHeight="250px"
          placeholder={`Start writing your ${category} notes here...`}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryNotes;