import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={cn('skeleton', className)} />;
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 7,
  className,
}) => {
  return (
    <div className={cn('table-skeleton-shell', className)}>
      <div className="p-4 border-b border-border bg-surface-sunken flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="divide-y divide-divider p-4 space-y-3">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex items-center gap-4 py-2">
            {Array.from({ length: cols }).map((_, cIndex) => (
              <Skeleton
                key={cIndex}
                className={cn(
                  'h-4 flex-1',
                  cIndex === 0 ? 'w-12 flex-none' : '',
                  cIndex === 1 ? 'w-32 flex-none' : '',
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
