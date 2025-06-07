"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { IconPicker } from '@/components/IconPicker';
import { PlusCircle } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required.' }).max(50, { message: 'Category name too long.'}),
  icon: z.string().min(1, { message: 'Icon is required.' }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AddCategoryDialogProps {
  onCategoryAdded: (name: string, icon: string) => Promise<void>;
  currentDate: string;
}

export function AddCategoryDialog({ onCategoryAdded, currentDate }: AddCategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'Home', // Default icon
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      await onCategoryAdded(data.name, data.icon);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add category", error);
      // Show toast error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for your notes on {currentDate}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Work, Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
