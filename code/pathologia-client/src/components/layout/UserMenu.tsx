import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, LogOut, KeyRound, ChevronDown, ShieldAlert } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/RoleBadge';
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
        className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-slate-800 leading-none">{user.fullName}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>{user.email}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-xl border border-slate-200/80 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
            <div className="mt-2">
              <RoleBadge role={user.role} />
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-teal-600" />
              <span>My Profile</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>Change Password</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
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
