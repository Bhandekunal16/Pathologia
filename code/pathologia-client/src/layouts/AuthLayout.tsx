import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-sidebar flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-admin-muted/40 rounded-full blur-3xl pointer-events-none" />

      <main className="z-10 w-full flex justify-center">
        <Outlet />
      </main>

      <footer className="mt-8 text-center text-[11px] text-sidebar-text-muted z-10">
        &copy; {new Date().getFullYear()} Pathologia Clinical Diagnostics Platform. All rights reserved.
      </footer>
    </div>
  );
};
