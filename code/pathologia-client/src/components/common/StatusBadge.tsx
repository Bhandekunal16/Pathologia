import React from 'react';
import { UserStatus } from '../../types/common.types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const isActive = status === 'ACTIVE';

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
        isActive
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-rose-50 text-rose-800 border-rose-200',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        )}
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  );
};
