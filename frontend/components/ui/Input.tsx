'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {React.cloneElement(leftIcon as React.ReactElement<any>, { className: 'w-4 h-4' })}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition duration-150',
              'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-xs hover:border-slate-300',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-400 focus:ring-rose-500/10 focus:border-rose-500',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center">
              {React.cloneElement(rightIcon as React.ReactElement<any>, { className: 'w-4 h-4' })}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
