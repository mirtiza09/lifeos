import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryNotes from '@/components/CategoryNotes';

export default function Finances() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-none mr-4">
            <ArrowLeft className="h-5 w-5 stroke-[1.25]" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium">Finances</h1>
      </header>
      
      <main className="flex-1 p-6">
        <div className="flex flex-col space-y-6">
          <CategoryNotes category="finances" title="Finance Notes" />
          
          <div className="flex flex-col items-center justify-center mt-8">
            <p className="text-muted-foreground text-center">
              Additional financial goals, budgeting, and money management tools will be added here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}