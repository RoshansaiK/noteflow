"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import type { AppUser } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';


interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as AppUser | null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        // Redirect to today's date page if logged in and on auth page
        const today = new Date().toISOString().split('T')[0];
        router.push(`/${today}`);
      }
    }
  }, [user, loading, router, pathname]);


  if (loading) {
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
    // Show loading spinner only if not on auth page or if trying to access protected route while loading
    if (!isAuthPage || (isAuthPage && user)) {
       return <div className="flex h-screen w-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }
  }
  
  // If on an auth page and not loading, render children (login/signup form)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
  if (isAuthPage && !loading) {
    return (
      <AuthContext.Provider value={{ user, loading }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // If user is not logged in and not on an auth page, router effect will redirect.
  // For a brief moment before redirect, we might not want to render anything or show minimal UI.
  // But typically the redirect is fast enough.
  if (!user && !isAuthPage && !loading) {
     return <div className="flex h-screen w-screen items-center justify-center"><LoadingSpinner size="lg" /></div>; // Or null, or a minimal non-auth layout
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user || isAuthPage ? children : null /* Avoid rendering main app if not logged in and not on auth page */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
