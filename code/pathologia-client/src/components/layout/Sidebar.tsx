import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Activity,
  ArrowLeftRight,
  FlaskConical,
  UserPlus,
  CalendarCheck,
  Menu,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebarStore();

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
      label: 'Audit Logs',
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
    item.roles.includes(user?.role || 'PATHOLOGIST'),
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 modal-overlay backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-text transition-[width] duration-300 ease-in-out',
          isCollapsed ? 'w-[52px]' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Top bar — ChatGPT-style panel toggle */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-sidebar-border px-3',
            isCollapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center rounded-lg p-1 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <Logo size="sm" />
            </button>
          ) : (
            <>
              <div className="hidden lg:flex min-w-0 items-center gap-2.5 overflow-hidden">
                <Logo size="md" />
                <div className="min-w-0">
                  <p className="sidebar-brand-title">Pathologia</p>
                  <p className="mt-0.5 truncate text-[10px] text-sidebar-text-muted">Medical Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="sidebar-toggle-btn"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Mobile: brand only (menu opens via header) */}
          <div className="flex min-w-0 items-center gap-2.5 overflow-hidden lg:hidden">
            <Logo size="md" />
            <div className="min-w-0">
              <p className="sidebar-brand-title">Pathologia</p>
              <p className="mt-0.5 truncate text-[10px] text-sidebar-text-muted">Medical Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg text-xs font-medium transition-colors duration-150',
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'sidebar-nav-item--active'
                      : 'sidebar-nav-item--idle',
                  )
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
