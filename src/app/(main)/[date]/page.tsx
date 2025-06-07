"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DateNavigator } from '@/components/DateNavigator';
import { CategoryList } from '@/components/CategoryList';
import { AddCategoryDialog } from '@/components/AddCategoryDialog';
import { SearchNotesBar } from '@/components/SearchNotesBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Category, Note } from '@/types';
import { addCategory, getCategories, addPredefinedCategoriesIfNeeded, deleteCategory, updateCategory } from '@/lib/firestoreService';
import { isValidDateString } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DatePage() {
  const params = useParams();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]); // For search, not fully implemented here
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isValidPageDate = date ? isValidDateString(date) : false;

  const fetchPageData = useCallback(async () => {
    if (!user || !isValidPageDate) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await addPredefinedCategoriesIfNeeded(date); // Add example categories if none exist for this day
      const fetchedCategories = await getCategories(date);
      setCategories(fetchedCategories);
      setFilteredCategories(fetchedCategories); // Initially, all categories are shown
      // TODO: Fetch all notes for search if implementing client-side global search
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast({ title: "Error", description: "Could not load data for this day.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, date, isValidPageDate, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchPageData();
    }
  }, [authLoading, fetchPageData]);

  // Client-side search filtering (basic example)
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCategories(categories);
    } else {
      // This basic search only filters category names. A full note search is more complex.
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(lowerSearchTerm)
        // TODO: Extend to search notes within categories if allNotes state is populated
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const handleAddCategory = async (name: string, icon: string) => {
    if (!user || !date) return;
    try {
      const newCategory = await addCategory(date, name, icon);
      setCategories(prev => [...prev, newCategory]);
      toast({ title: "Category Added", description: `Category "${name}" created.` });
    } catch (error) {
      console.error("Failed to add category:", error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    }
  };
  
  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };


  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // AuthProvider should redirect, but this is a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to view your notes.</p>
      </div>
    );
  }

  if (!isValidPageDate) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Invalid Date</h1>
        <p>The date in the URL is not valid.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 flex-grow">
      <DateNavigator currentDate={date} />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchNotesBar onSearchChange={setSearchTerm} />
        <AddCategoryDialog onCategoryAdded={handleAddCategory} currentDate={date} />
      </div>

      {filteredCategories.length > 0 ? (
        <CategoryList 
          categories={filteredCategories} 
          currentDate={date}
          onCategoryDeleted={handleCategoryDeleted}
          onCategoryUpdated={handleCategoryUpdated}
        />
      ) : searchTerm ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No categories match your search for "{searchTerm}".</p>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground mb-2">No categories for this day yet.</p>
          <p className="text-sm text-muted-foreground">Click "Add Category" to get started!</p>
        </div>
      )}
    </div>
  );
}
