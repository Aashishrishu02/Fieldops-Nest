'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, Lock, Mail, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      showToast('Authentication successful', 'success');

      if (result.mustChangePassword) {
        showToast('First login detected: Please configure your permanent password', 'info');
        router.push('/reset-password?mandatory=true');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col lg:flex-row">
      {/* Left Column: Branding, Product Statement & Simple Feature Points (No Images) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FAFAF8] border-r border-[#E7E7E3] p-10 xl:p-16 flex-col justify-between">
        {/* Simple Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-slate-900">
              FieldOps
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Operations CRM
            </span>
          </div>
        </div>

        {/* Vertically Centered Editorial Text Content */}
        <div className="my-auto max-w-md py-12">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            The unified operations platform for modern field teams.
          </h1>
          <p className="text-sm text-slate-500 mt-3.5 leading-relaxed">
            Plan on-site visits, track attendance, and manage field operations with role-based access.
          </p>

          {/* Simple Feature Points */}
          <div className="mt-8 pt-6 border-t border-[#E7E7E3] space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 flex-shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Field Operations</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 flex-shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Attendance Tracking</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 flex-shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Role-Based Access</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400">
          FieldOps Systems &bull; Enterprise CRM
        </div>
      </div>

      {/* Right Column: Authentication Card (Vertically Centered) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            FieldOps
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Card Header */}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access the operations console.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#E7E7E3] shadow-card">
            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email / Username"
                type="email"
                placeholder="name@fieldops.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isLoading}
                className="w-full mt-1"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2.5 text-slate-400 font-medium tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-lg text-xs transition shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google Account</span>
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="mt-5 p-3.5 bg-white rounded-xl border border-[#E7E7E3] shadow-xs">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick Demo Access
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin@fieldops.local', 'AdminPassword@123!')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 px-1.5 rounded text-center transition"
              >
                <div className="text-[11px] font-semibold text-slate-800">SuperAdmin</div>
                <div className="text-[9px] text-slate-500">Full control</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('manager@fieldops.local', 'Manager@123!')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 px-1.5 rounded text-center transition"
              >
                <div className="text-[11px] font-semibold text-slate-800">Manager</div>
                <div className="text-[9px] text-slate-500">Team view</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('employee@fieldops.local', 'Employee@123!')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 px-1.5 rounded text-center transition"
              >
                <div className="text-[11px] font-semibold text-slate-800">Employee</div>
                <div className="text-[9px] text-slate-500">Field work</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
