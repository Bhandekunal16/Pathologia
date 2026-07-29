import React from 'react';
import { ShieldCheck, Stethoscope } from 'lucide-react';
import { UserRole } from '../../types/common.types';
import { cn } from '../../lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const isAdmin = role === 'ADMIN';

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
        isAdmin
          ? 'bg-purple-50 text-purple-800 border-purple-200'
          : 'bg-teal-50 text-teal-800 border-teal-200',
        className
      )}
    >
      {isAdmin ? (
        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
      ) : (
        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
      )}
      <span>{isAdmin ? 'Admin' : 'Pathologist'}</span>
    </span>
  );
};
