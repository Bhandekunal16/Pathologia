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
        'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-card',
        isActive
          ? 'bg-success-muted text-success border-success-border'
          : 'bg-danger-muted text-danger border-danger-border',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-success animate-pulse' : 'bg-danger'
        )}
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  );
};
