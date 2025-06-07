"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, getNextDay, getPreviousDay } from '@/lib/utils';

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD format
}

export function DateNavigator({ currentDate }: DateNavigatorProps) {
  const router = useRouter();

  const handlePreviousDay = () => {
    router.push(`/${getPreviousDay(currentDate)}`);
  };

  const handleNextDay = () => {
    router.push(`/${getNextDay(currentDate)}`);
  };

  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <Button variant="outline" size="icon" onClick={handlePreviousDay} aria-label="Previous day">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center min-w-[200px] md:min-w-[280px]">
        {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
      </h2>
      <Button variant="outline" size="icon" onClick={handleNextDay} aria-label="Next day">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
