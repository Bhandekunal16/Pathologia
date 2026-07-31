import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { ThemeMenuPicker } from '../theme/ThemeMenuPicker';
import { useAuth } from '../../hooks/useAuth';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-surface-sunken/80 transition-colors focus:outline-hidden focus:ring-2 focus-ring"
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-foreground leading-none">{user.fullName}</div>
          <div className="text-[11px] text-foreground-muted mt-1 flex items-center space-x-1">
            <span>{user.email}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-foreground-subtle hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface p-2 shadow-xl border border-border/80 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-border-subtle">
            <p className="text-xs font-bold text-foreground">{user.fullName}</p>
            <p className="text-[11px] text-foreground-muted truncate mt-0.5">{user.email}</p>
            <div className="mt-2">
              <RoleBadge role={user.role} />
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground-secondary hover:bg-accent-subtle hover:text-accent transition-colors"
            >
              <UserIcon className="w-4 h-4 text-accent" />
              <span>My Profile</span>
            </Link>

            <Link
              to="/profile?tab=security"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground-secondary hover:bg-accent-subtle hover:text-accent transition-colors"
            >
              <KeyRound className="w-4 h-4 text-accent" />
              <span>Change Password</span>
            </Link>

            <ThemeMenuPicker />
          </div>

          <div className="pt-1 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-danger hover:bg-danger-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
