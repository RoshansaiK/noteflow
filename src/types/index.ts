import type { User as FirebaseUser } from 'firebase/auth';

export interface AppUser extends FirebaseUser {}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  noteCount?: number; // Optional, can be derived
  createdAt: number; // Timestamp
}

export interface Note {
  id: string;
  text: string;
  imageUrl?: string;
  voiceUrl?: string;
  isFavorite: boolean;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}
