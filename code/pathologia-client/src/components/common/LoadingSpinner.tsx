import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-3',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={cn(
          'rounded-full border-teal-200 border-t-teal-700 animate-spin',
          sizeMap[size],
          className
        )}
      />
      {label && <span className="mt-2 text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
};
