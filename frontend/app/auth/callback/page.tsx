'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth-context';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAuthSession(token).then(() => {
        router.push('/dashboard');
      });
    } else {
      router.push('/login?error=OAuthAuthenticationFailed');
    }
  }, [searchParams, router, setAuthSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-medium">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F5]" />}>
      <CallbackContent />
    </Suspense>
  );
}
