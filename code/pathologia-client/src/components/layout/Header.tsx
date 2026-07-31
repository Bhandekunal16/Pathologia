import React from 'react';
import { Menu, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { Logo } from '../common/Logo';
import { useSidebarStore } from '../../store/sidebarStore';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/common.types';

const roleHeaderConfig: Record<
  UserRole,
  {
    portalLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
  }
> = {
  ADMIN: {
    portalLabel: 'Admin Portal',
    icon: ShieldCheck,
    iconClassName: 'text-admin',
  },
  PATHOLOGIST: {
    portalLabel: 'Clinical Workspace',
    icon: Stethoscope,
    iconClassName: 'text-accent',
  },
  USER: {
    portalLabel: 'User Portal',
    icon: User,
    iconClassName: 'text-foreground-muted',
  },
};

export const Header: React.FC = () => {
  const { toggleMobile } = useSidebarStore();
  const { user } = useAuth();
  const headerConfig = roleHeaderConfig[user?.role || 'USER'];
  const AccessIcon = headerConfig.icon;

  return (
    <header className="z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 shadow-card">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="rounded-lg min-h-11 min-w-11 inline-flex items-center justify-center text-foreground-muted hover:bg-surface-sunken lg:hidden focus:outline-hidden focus:ring-2 focus-ring"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo in header for mobile / quick view */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          <Logo size="sm" />
          <span className="text-sm font-extrabold text-foreground tracking-tight">
            Path<span className="text-accent">ologia</span>
          </span>
        </div>

        {/* Desktop Header Context Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-foreground-muted bg-surface-sunken border border-border px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>{headerConfig.portalLabel}</span>
          <AccessIcon className={`w-3.5 h-3.5 ${headerConfig.iconClassName}`} />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <UserMenu />
      </div>
    </header>
  );
};
