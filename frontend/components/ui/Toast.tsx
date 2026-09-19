'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-modal bg-white transition-all duration-200',
              toast.type === 'success' && 'border-emerald-200 text-slate-900',
              toast.type === 'error' && 'border-rose-200 text-slate-900',
              toast.type === 'info' && 'border-slate-200 text-slate-900',
            )}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="font-semibold text-xs text-slate-900 leading-tight mb-0.5">{toast.title}</h4>}
              <p className="text-xs text-slate-600 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
