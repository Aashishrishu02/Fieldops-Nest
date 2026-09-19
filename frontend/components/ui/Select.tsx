'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 transition duration-150 pr-9',
              'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-xs cursor-pointer hover:border-slate-300',
              error && 'border-rose-400 focus:ring-rose-500/10 focus:border-rose-500',
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
