import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  ArrowLeftRight,
  FlaskConical,
  UserPlus,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebarStore();

  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PATHOLOGIST', 'USER'],
    },
    {
      label: 'Users Management',
      path: '/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      label: 'Pathology Tests',
      path: '/pathology-tests',
      icon: FlaskConical,
      roles: ['ADMIN', 'PATHOLOGIST', 'USER'],
    },
    {
      label: 'Test Booking',
      path: '/test-booking',
      icon: CalendarCheck,
      roles: ['PATHOLOGIST', 'USER'],
    },
    {
      label: 'Blood Test Tracking',
      path: '/blood-test-tracking',
      icon: Activity,
      roles: ['PATHOLOGIST', 'USER'],
    },
    {
      label: 'Invite User',
      path: '/invite-user',
      icon: UserPlus,
      roles: ['PATHOLOGIST'],
    },
    {
      label: 'Request & Response',
      path: '/request-response',
      icon: ArrowLeftRight,
      roles: ['ADMIN'],
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: User,
      roles: ['ADMIN', 'PATHOLOGIST', 'USER'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'PATHOLOGIST')
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out lg:static',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shadow-md shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight leading-none">
                  Path<span className="text-teal-400">ologia</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                  Medical Platform
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Main Menu
            </div>
          )}

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Footer Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/80">
            <div className="p-2 rounded-lg bg-slate-700 text-teal-400 shrink-0">
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user?.fullName}</div>
                <div className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">
                  {user?.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
