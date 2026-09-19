'use client';

import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  const iconBgMap = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    rose: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <Card className="p-4 sm:p-5 hover:border-slate-300 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBgMap[color])}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded-md',
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </Card>
  );
};
