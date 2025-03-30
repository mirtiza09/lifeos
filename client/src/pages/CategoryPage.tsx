import React from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryNotes from '@/components/CategoryNotes';

export default function CategoryPage() {
  const [, params] = useRoute('/:category');
  const category = params?.category || '';
  
  // Format the category name to display in the UI
  const formattedCategoryName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-none mr-4">
            <ArrowLeft className="h-5 w-5 stroke-[1.25]" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium">{formattedCategoryName}</h1>
      </header>
      
      <main className="flex-1 p-6">
        <div className="flex flex-col space-y-6">
          <CategoryNotes category={category} title={`${formattedCategoryName} Notes`} />
          
          <div className="flex flex-col items-center justify-center mt-8">
            <p className="text-muted-foreground text-center">
              Add additional {formattedCategoryName.toLowerCase()}-related information, goals, and tracking here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}