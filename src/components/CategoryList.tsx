"use client";

import type { Category } from '@/types';
import { CategoryItem } from './CategoryItem';

interface CategoryListProps {
  categories: Category[];
  currentDate: string;
  onCategoryDeleted: (categoryId: string) => void;
  onCategoryUpdated: (updatedCategory: Category) => void;
}

export function CategoryList({ categories, currentDate, onCategoryDeleted, onCategoryUpdated }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground mb-2">No categories for this day yet.</p>
        <p className="text-sm text-muted-foreground">Click "Add Category" to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryItem 
          key={category.id} 
          category={category} 
          currentDate={currentDate}
          onCategoryDeleted={onCategoryDeleted}
          onCategoryUpdated={onCategoryUpdated}
        />
      ))}
    </div>
  );
}
