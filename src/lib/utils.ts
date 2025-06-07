import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addDays, subDays, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatString: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid Date";
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getNextDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(addDays(date, 1), 'yyyy-MM-dd');
}

export function getPreviousDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(subDays(date, 1), 'yyyy-MM-dd');
}

export function isValidDateString(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date) && format(date, 'yyyy-MM-dd') === dateString;
}

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// A simple debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
