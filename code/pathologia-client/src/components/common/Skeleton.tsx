import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/70', className)}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 7,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="divide-y divide-slate-100 p-4 space-y-3">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex items-center space-x-4 py-2">
            {Array.from({ length: cols }).map((_, cIndex) => (
              <Skeleton
                key={cIndex}
                className={cn(
                  'h-4 flex-1',
                  cIndex === 0 ? 'w-12 flex-none' : '',
                  cIndex === 1 ? 'w-32 flex-none font-semibold' : ''
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
