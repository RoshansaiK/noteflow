"use client";

import type { Note } from '@/types';
import { NoteItem } from './NoteItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteListProps {
  notes: Note[];
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteList({ notes, onToggleFavorite, onEditNote, onDeleteNote }: NoteListProps) {
  if (notes.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No notes in this category yet.</p>;
  }

  return (
    <ScrollArea className="h-auto max-h-[400px] pr-3"> {/* Adjust max-h as needed */}
      <div className="space-y-2">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
