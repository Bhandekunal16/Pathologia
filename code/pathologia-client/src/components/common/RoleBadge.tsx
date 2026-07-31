import React from 'react';
import { ShieldCheck, Stethoscope, User as UserIcon } from 'lucide-react';
import { UserRole } from '../../types/common.types';
import { cn } from '../../lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; className: string; iconClassName: string }
> = {
  ADMIN: {
    label: 'Admin',
    icon: ShieldCheck,
    className: 'bg-admin-muted text-admin border-admin-border',
    iconClassName: 'text-admin',
  },
  PATHOLOGIST: {
    label: 'Pathologist',
    icon: Stethoscope,
    className: 'bg-accent-subtle text-accent border-accent-muted',
    iconClassName: 'text-accent',
  },
  USER: {
    label: 'User',
    icon: UserIcon,
    className: 'bg-surface-sunken text-foreground-secondary border-border',
    iconClassName: 'text-foreground-muted',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const { label, icon: Icon, className: roleClassName, iconClassName } = roleConfig[role];

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-card',
        roleClassName,
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', iconClassName)} />
      <span>{label}</span>
    </span>
  );
};
