import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  return (
    <img
      src="/favicon.svg"
      alt="Pathologia"
      className={cn('shrink-0 rounded-lg object-contain', sizeClasses[size], className)}
    />
  );
};
