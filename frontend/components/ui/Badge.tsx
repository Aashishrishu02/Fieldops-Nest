'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md tracking-tight';

  const variants = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    outline: 'bg-transparent text-slate-600 border border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
