"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { suggestNoteIdeas, type SuggestNoteIdeasInput, type SuggestNoteIdeasOutput } from '@/ai/flows/suggest-note-ideas';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface AiSuggestionsButtonProps {
  categoryName: string;
  currentNotesText?: string; // Optional: comma-separated list of current note texts
}

export function AiSuggestionsButton({ categoryName, currentNotesText }: AiSuggestionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const input: SuggestNoteIdeasInput = {
        category: categoryName,
        currentNotes: currentNotesText,
      };
      const result: SuggestNoteIdeasOutput = await suggestNoteIdeas(input);
      if (result.ideas && result.ideas.length > 0) {
        setSuggestions(result.ideas);
        setIsAlertOpen(true);
      } else {
        toast({ title: 'No suggestions', description: 'AI could not generate suggestions at this time.' });
      }
    } catch (error: any) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleGetSuggestions} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Get AI Ideas
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Note Ideas for "{categoryName}"</AlertDialogTitle>
            <AlertDialogDescription>
              Here are some AI-generated ideas to inspire your notes:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc list-inside space-y-1 my-4 text-sm">
            {suggestions.map((idea, index) => (
              <li key={index}>{idea}</li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
