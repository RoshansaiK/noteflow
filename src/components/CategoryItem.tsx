"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Category, Note } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { NoteList } from './NoteList';
import { AddNoteDialog } from './AddNoteDialog';
import { AiSuggestionsButton } from './AiSuggestionsButton';
import { getNotes, addNote, updateNote, deleteNote as deleteFirestoreNote, updateCategory as updateFirestoreCategory, deleteCategory as deleteFirestoreCategory } from '@/lib/firestoreService';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';
import { Edit3, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { IconPicker } from './IconPicker';


interface CategoryItemProps {
  category: Category;
  currentDate: string;
  onCategoryDeleted: (categoryId: string) => void;
  onCategoryUpdated: (updatedCategory: Category) => void;
}

export function CategoryItem({ category, currentDate, onCategoryDeleted, onCategoryUpdated }: CategoryItemProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState(category.name);
  const [editedCategoryIcon, setEditedCategoryIcon] = useState(category.icon);

  const { toast } = useToast();

  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ElementType || LucideIcons.Folder;
  const isEmoji = /\p{Emoji}/u.test(category.icon);

  const fetchNotes = useCallback(async () => {
    if (!category.id) return;
    setIsLoadingNotes(true);
    try {
      const fetchedNotes = await getNotes(currentDate, category.id);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({ title: 'Error', description: 'Could not fetch notes.', variant: 'destructive' });
    } finally {
      setIsLoadingNotes(false);
    }
  }, [currentDate, category.id, toast]);


  const handleNoteSave = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, noteId?: string) => {
    try {
      if (noteId) { // Editing existing note
        await updateNote(currentDate, category.id, noteId, noteData);
        toast({ title: 'Note Updated', description: 'Your note has been successfully updated.' });
      } else { // Adding new note
        await addNote(currentDate, category.id, noteData);
        toast({ title: 'Note Added', description: 'Your note has been successfully added.' });
      }
      fetchNotes(); // Refresh notes list
    } catch (error) {
      console.error('Error saving note:', error);
      toast({ title: 'Error', description: 'Could not save note.', variant: 'destructive' });
    }
  };

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean) => {
    try {
      await updateNote(currentDate, category.id, noteId, { isFavorite });
      setNotes(prevNotes => prevNotes.map(n => n.id === noteId ? { ...n, isFavorite } : n));
      toast({ title: 'Favorite status updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not update favorite status.', variant: 'destructive' });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsAddNoteDialogOpen(true);
  };
  
  const openAddNoteDialog = () => {
    setEditingNote(null); // Ensure it's for a new note
    setIsAddNoteDialogOpen(true);
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteFirestoreNote(currentDate, category.id, noteId);
      fetchNotes(); // Refresh notes list
      toast({ title: 'Note Deleted', description: 'Your note has been successfully deleted.' });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({ title: 'Error', description: 'Could not delete note.', variant: 'destructive' });
    }
  };
  
  const handleDeleteCategory = async () => {
    try {
      await deleteFirestoreCategory(currentDate, category.id);
      onCategoryDeleted(category.id);
      toast({ title: 'Category Deleted', description: `Category "${category.name}" and its notes deleted.` });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Error', description: 'Could not delete category.', variant: 'destructive' });
    }
  };

  const handleSaveCategoryEdit = async () => {
    if (editedCategoryName.trim() === '' || editedCategoryIcon.trim() === '') {
        toast({ title: 'Error', description: 'Category name and icon cannot be empty.', variant: 'destructive'});
        return;
    }
    try {
        const updatedData = { name: editedCategoryName, icon: editedCategoryIcon };
        await updateFirestoreCategory(currentDate, category.id, updatedData);
        onCategoryUpdated({ ...category, ...updatedData });
        setIsEditingCategory(false);
        toast({ title: 'Category Updated', description: 'Category details saved.'});
    } catch (error) {
        console.error('Error updating category:', error);
        toast({ title: 'Error', description: 'Could not update category.', variant: 'destructive'});
    }
  };


  return (
    <Card className="mb-4 overflow-hidden shadow-lg rounded-xl">
      <Accordion type="single" collapsible onValueChange={(value) => {
        if (value === category.id && notes.length === 0) { // Only fetch if opening and notes not loaded
          fetchNotes();
        }
      }}>
        <AccordionItem value={category.id} className="border-b-0">
          <CardHeader className="p-4 hover:bg-secondary/50 transition-colors">
            <AccordionTrigger className="w-full p-0 hover:no-underline [&[data-state=open]>svg]:text-primary">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                 {isEditingCategory ? (
                    <IconPicker value={editedCategoryIcon} onChange={setEditedCategoryIcon} />
                  ) : (
                    isEmoji ? <span className="text-3xl">{category.icon}</span> : <IconComponent className="h-7 w-7 text-primary" />
                  )}
                  {isEditingCategory ? (
                     <Input 
                        value={editedCategoryName} 
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="h-9 text-lg font-semibold"
                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                     />
                  ) : (
                    <CardTitle className="text-xl font-headline">{category.name}</CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CardDescription className="text-sm whitespace-nowrap">
                    {category.noteCount ?? notes.length} note{notes.length !== 1 ? 's' : ''}
                  </CardDescription>
                  {/* Chevron is part of AccordionTrigger */}
                </div>
              </div>
            </AccordionTrigger>
            <div className="flex items-center gap-1 mt-2">
                {isEditingCategory ? (
                    <>
                        <Button size="sm" variant="default" onClick={handleSaveCategoryEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingCategory(false)}>Cancel</Button>
                    </>
                ) : (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setIsEditingCategory(true); }} title="Edit category">
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()} title="Delete category">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-headline">Delete Category "{category.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the category and all its notes. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="p-4 pt-0">
              {isLoadingNotes ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <NoteList
                  notes={notes}
                  onToggleFavorite={handleToggleFavorite}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={openAddNoteDialog} className="flex-1">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Note
                </Button>
                <AiSuggestionsButton 
                  categoryName={category.name} 
                  currentNotesText={notes.map(n => n.text).join(', ')} 
                />
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <AddNoteDialog
        isOpen={isAddNoteDialogOpen}
        onOpenChange={setIsAddNoteDialogOpen}
        onNoteSave={handleNoteSave}
        categoryName={category.name}
        existingNote={editingNote}
      />
    </Card>
  );
}
