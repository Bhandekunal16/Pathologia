import React from 'react';
import { Menu, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useSidebarStore } from '../../store/sidebarStore';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { toggleMobile } = useSidebarStore();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo in header for mobile / quick view */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            Pathologist<span className="text-teal-600">Friend</span>
          </span>
        </div>

        {/* Desktop Header Context Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Clinical Pathology Portal</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 flex items-center space-x-1">
            {user?.role === 'ADMIN' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 inline" />
                <span>Admin Level Access</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 inline" />
                <span>Pathologist Workspace</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <UserMenu />
      </div>
    </header>
  );
};
