"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTodayDateString } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';


export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const today = getTodayDateString();
        router.replace(`/${today}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
