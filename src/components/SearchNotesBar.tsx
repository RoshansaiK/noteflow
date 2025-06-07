"use client";

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchNotesBarProps {
  onSearchChange: (searchTerm: string) => void;
}

export function SearchNotesBar({ onSearchChange }: SearchNotesBarProps) {
  const debouncedSearch = debounce((term: string) => {
    onSearchChange(term);
  }, 300);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto my-4">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search notes for this day..."
        className="pl-10 pr-4 py-2 text-base"
        onChange={handleChange}
      />
    </div>
  );
}
