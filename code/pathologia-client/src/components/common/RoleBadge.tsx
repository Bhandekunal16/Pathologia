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
    className: 'bg-purple-50 text-purple-800 border-purple-200',
    iconClassName: 'text-purple-600',
  },
  PATHOLOGIST: {
    label: 'Pathologist',
    icon: Stethoscope,
    className: 'bg-teal-50 text-teal-800 border-teal-200',
    iconClassName: 'text-teal-600',
  },
  USER: {
    label: 'User',
    icon: UserIcon,
    className: 'bg-slate-50 text-slate-700 border-slate-200',
    iconClassName: 'text-slate-600',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const { label, icon: Icon, className: roleClassName, iconClassName } = roleConfig[role];

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
        roleClassName,
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', iconClassName)} />
      <span>{label}</span>
    </span>
  );
};
