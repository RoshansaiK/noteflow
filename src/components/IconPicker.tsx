"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react'; // Import all icons
import { Smile } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

// Subset of Lucide icons for brevity & relevance
const relevantIconNames = [
  'Home', 'ShoppingCart', 'Film', 'DollarSign', 'Receipt', 'BookOpen', 'Briefcase', 'Utensils', 
  'Plane', 'Gift', 'Heart', 'Star', 'Music', 'ImageIcon', 'Mic', 'MapPin', 'CalendarDays', 'Edit3'
] as const;
type RelevantIconName = typeof relevantIconNames[number];

const lucideIconsArray = relevantIconNames.map(name => ({ name, IconComponent: LucideIcons[name as keyof typeof LucideIcons] as React.ElementType }));


const defaultEmojis = ['😀', '🎉', '💡', '💰', '✈️', '🍽️', '🏠', '💻', '❤️', '⭐', '✏️', '🛍️', '🎬', '🧾', '🍔'];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const filteredLucideIcons = lucideIconsArray.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) && icon.IconComponent
  );

  const filteredEmojis = defaultEmojis.filter(emoji =>
    emoji.includes(searchTerm)
  );

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsPopoverOpen(false);
    setSearchTerm('');
  };

  const CurrentIconDisplay = () => {
    // Check if value is an emoji (simple check)
    if (/\p{Emoji}/u.test(value)) {
      return <span className="text-2xl">{value}</span>;
    }
    // Check if it's a known Lucide icon
    const IconComponent = LucideIcons[value as keyof typeof LucideIcons] as React.ElementType;
    if (IconComponent) {
      return <IconComponent className="h-5 w-5" />;
    }
    return <Smile className="h-5 w-5 text-muted-foreground" />; // Default or placeholder
  };


  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal gap-2">
          <CurrentIconDisplay />
          {value || "Select Icon"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search icons or emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2 grid grid-cols-5 gap-1">
            {filteredLucideIcons.map(({ name, IconComponent }) => (
              <Button
                key={name}
                variant="ghost"
                size="icon"
                onClick={() => handleSelect(name)}
                className="h-9 w-9"
                title={name}
              >
                <IconComponent className="h-5 w-5" />
              </Button>
            ))}
            {filteredEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                onClick={() => handleSelect(emoji)}
                className="text-xl h-9 w-9 p-0" 
                title={emoji}
              >
                {emoji}
              </Button>
            ))}
          </div>
          {(filteredLucideIcons.length === 0 && filteredEmojis.length === 0) && (
            <p className="p-2 text-sm text-center text-muted-foreground">No icons found.</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
