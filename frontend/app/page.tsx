'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.mustChangePassword) {
        router.push('/reset-password?mandatory=true');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-medium">Entering FieldOps...</p>
      </div>
    </div>
  );
}
