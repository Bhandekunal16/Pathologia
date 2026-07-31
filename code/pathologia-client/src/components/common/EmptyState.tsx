import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  embedded?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items matching your current criteria or filters.',
  icon,
  action,
  embedded = false,
}) => {
  return (
    <div className={cn('empty-state', embedded && 'bg-surface')}>
      <div className="empty-state-icon">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
