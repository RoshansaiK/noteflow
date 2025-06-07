"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Note } from '@/types';
import { Input } from './ui/input';
import { Image as ImageIcon, Mic } from 'lucide-react';

const noteSchema = z.object({
  text: z.string().min(1, { message: 'Note text cannot be empty.' }),
  imageUrl: z.string().url().optional().or(z.literal('')), // Optional image URL
  // voiceUrl: z.string().url().optional(), // For voice notes - not implemented
  isFavorite: z.boolean().default(false),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface AddNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNoteSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, noteId?: string) => Promise<void>;
  categoryName: string;
  existingNote?: Note | null; // For editing
}

export function AddNoteDialog({
  isOpen,
  onOpenChange,
  onNoteSave,
  categoryName,
  existingNote,
}: AddNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      text: '',
      imageUrl: '',
      isFavorite: false,
    },
  });

  useEffect(() => {
    if (existingNote) {
      form.reset({
        text: existingNote.text,
        imageUrl: existingNote.imageUrl || '',
        isFavorite: existingNote.isFavorite,
      });
    } else {
      form.reset({
        text: '',
        imageUrl: '',
        isFavorite: false,
      });
    }
  }, [existingNote, form, isOpen]); // Re-populate form when dialog opens or existingNote changes

  const onSubmit = async (data: NoteFormValues) => {
    setIsLoading(true);
    try {
      await onNoteSave(data, existingNote?.id);
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to save note", error);
      // Show toast error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {existingNote ? 'Edit Note' : 'Add New Note'} in {categoryName}
          </DialogTitle>
          <DialogDescription>
            {existingNote ? 'Update the details of your note.' : 'Create a new note for this category.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your note here..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="url" placeholder="https://example.com/image.png" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Placeholder for Voice Note upload/recording - Not implemented */}
            <div className="space-y-1">
                <Label>Voice Note (Optional)</Label>
                <Button type="button" variant="outline" className="w-full" disabled>
                    <Mic className="mr-2 h-4 w-4" /> Add Voice Note (Feature coming soon)
                </Button>
            </div>

            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as Favorite
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (existingNote ? 'Saving...' : 'Adding...') : (existingNote ? 'Save Changes' : 'Add Note')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
