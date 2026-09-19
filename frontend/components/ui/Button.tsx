'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const variants = {
      primary:
        'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 shadow-xs',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs',
      outline:
        'bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-xs',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-4.5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
