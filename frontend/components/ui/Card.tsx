'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-[#E7E7E3] shadow-xs transition duration-150',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
