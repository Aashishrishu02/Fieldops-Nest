'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user?.mustChangePassword && pathname !== '/reset-password') {
        router.push('/reset-password?mandatory=true');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading FieldOps...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-red-500/20 text-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your role (<span className="text-blue-400 font-semibold">{user?.role?.name}</span>) does not possess the{' '}
            <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 text-xs">{requiredPermission}</code> permission required to access this resource.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-4 rounded-xl text-sm font-medium transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-amber-500/20 text-center">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Role Clearance Required</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            This module requires membership in: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-4 rounded-xl text-sm font-medium transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
