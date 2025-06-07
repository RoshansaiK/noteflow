"use client";

import type { Note } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Edit3, Trash2, Image as ImageIcon, Mic } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Image from 'next/image';

interface NoteItemProps {
  note: Note;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteItem({ note, onToggleFavorite, onEdit, onDelete }: NoteItemProps) {
  return (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-4">
        {note.imageUrl && (
          <div className="mb-2 relative w-full h-40 rounded-md overflow-hidden">
            <Image 
                src={note.imageUrl} 
                alt="Note image" 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint="abstract background" 
            />
          </div>
        )}
        <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
        {note.voiceUrl && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="h-4 w-4" />
            <span>Voice note attached</span> {/* Basic placeholder for voice note */}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 pb-3 px-4">
        <span>{formatDate(new Date(note.updatedAt), 'MMM d, HH:mm')}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleFavorite(note.id, !note.isFavorite)}
            title={note.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
          >
            <Star className={cn('h-4 w-4', note.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground')} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(note)} title="Edit note">
            <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(note.id)} title="Delete note">
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
