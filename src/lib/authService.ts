import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logIn = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async (): Promise<void> => {
  return signOut(auth);
};
