import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  writeBatch,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import type { Category, Note } from '@/types';

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Category Functions
export const addCategory = async (date: string, categoryName: string, icon: string): Promise<Category> => {
  const userId = getUserId();
  const newCategoryRef = doc(collection(db, `users/${userId}/days/${date}/categories`));
  const categoryData: Omit<Category, 'id' | 'noteCount'> = {
    name: categoryName,
    icon,
    createdAt: Timestamp.now().toMillis(),
  };
  await setDoc(newCategoryRef, categoryData);
  return { id: newCategoryRef.id, ...categoryData, noteCount: 0 };
};

export const getCategories = async (date: string): Promise<Category[]> => {
  const userId = getUserId();
  const categoriesCol = collection(db, `users/${userId}/days/${date}/categories`);
  const q = query(categoriesCol, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  
  const categories = await Promise.all(snapshot.docs.map(async (docSnap) => {
    const category = { id: docSnap.id, ...docSnap.data() } as Category;
    // Get note count
    const notesCol = collection(db, `users/${userId}/days/${date}/categories/${category.id}/notes`);
    const notesSnapshot = await getDocs(notesCol);
    category.noteCount = notesSnapshot.size;
    return category;
  }));
  return categories;
};

export const updateCategory = async (date: string, categoryId: string, data: Partial<Category>): Promise<void> => {
  const userId = getUserId();
  const categoryRef = doc(db, `users/${userId}/days/${date}/categories`, categoryId);
  return updateDoc(categoryRef, data);
};

export const deleteCategory = async (date: string, categoryId: string): Promise<void> => {
  const userId = getUserId();
  // Firestore does not automatically delete subcollections.
  // Need to delete all notes in the category first.
  const notesCol = collection(db, `users/${userId}/days/${date}/categories/${categoryId}/notes`);
  const notesSnapshot = await getDocs(notesCol);
  const batch = writeBatch(db);
  notesSnapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
  await batch.commit();

  const categoryRef = doc(db, `users/${userId}/days/${date}/categories`, categoryId);
  return deleteDoc(categoryRef);
};


// Note Functions
export const addNote = async (date: string, categoryId: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
  const userId = getUserId();
  const newNoteRef = doc(collection(db, `users/${userId}/days/${date}/categories/${categoryId}/notes`));
  const fullNoteData = {
    ...noteData,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
  };
  await setDoc(newNoteRef, fullNoteData);
  return { id: newNoteRef.id, ...fullNoteData };
};

export const getNotes = async (date: string, categoryId: string): Promise<Note[]> => {
  const userId = getUserId();
  const notesCol = collection(db, `users/${userId}/days/${date}/categories/${categoryId}/notes`);
  const q = query(notesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Note));
};

export const updateNote = async (date: string, categoryId: string, noteId: string, data: Partial<Note>): Promise<void> => {
  const userId = getUserId();
  const noteRef = doc(db, `users/${userId}/days/${date}/categories/${categoryId}/notes`, noteId);
  return updateDoc(noteRef, { ...data, updatedAt: Timestamp.now().toMillis() });
};

export const deleteNote = async (date: string, categoryId: string, noteId: string): Promise<void> => {
  const userId = getUserId();
  const noteRef = doc(db, `users/${userId}/days/${date}/categories/${categoryId}/notes`, noteId);
  return deleteDoc(noteRef);
};

// Example predefined categories - to be added by user or a setup script
export const PREDEFINED_CATEGORIES = [
  { name: 'Movies', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Home', icon: '🏠' },
  { name: 'Other', icon: '✏️' },
  { name: 'Bills', icon: '🧾' },
  { name: 'Income', icon: '💰' },
  { name: 'Food & Drinks', icon: '🍔' },
];

// Function to add predefined categories for a user for a specific date if they don't exist
export const addPredefinedCategoriesIfNeeded = async (date: string): Promise<void> => {
  const userId = getUserId();
  const categories = await getCategories(date);
  if (categories.length === 0) {
    const batch = writeBatch(db);
    PREDEFINED_CATEGORIES.forEach(cat => {
      const newCategoryRef = doc(collection(db, `users/${userId}/days/${date}/categories`));
      const categoryData: Omit<Category, 'id' | 'noteCount'> = {
        name: cat.name,
        icon: cat.icon,
        createdAt: Timestamp.now().toMillis(),
      };
      batch.set(newCategoryRef, categoryData);
    });
    await batch.commit();
  }
};
