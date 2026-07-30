import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useSidebarStore } from '../store/sidebarStore';
import { cn } from '../lib/utils';

export const DashboardLayout: React.FC = () => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="h-screen overflow-hidden bg-slate-50/50 text-slate-800">
      <Sidebar />
      <div
        className={cn(
          'flex h-screen min-w-0 flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
