import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardCards } from '../features/dashboard/DashboardCards';
import { ActivityPlaceholder } from '../features/dashboard/ActivityPlaceholder';
import { QuickActions } from '../features/dashboard/QuickActions';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { dashboardStats, isLoadingStats, isAdmin } = useUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Pathologist'}`}
        description={
          isAdmin
            ? 'Overview of clinical pathology accounts, active personnel, and workspace audit logs.'
            : 'Your clinical pathology workspace overview and quick actions.'
        }
        action={
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Pathology System Online</span>
          </div>
        }
      />

      {isAdmin ? (
        <DashboardCards stats={dashboardStats} isLoading={isLoadingStats} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900">Your Workspace</h3>
          <p className="text-xs text-slate-500 mt-1">
            You are signed in as a {user?.role?.toLowerCase()}. Use the sidebar to manage your profile
            and access clinical tools.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isAdmin ? (
            <ActivityPlaceholder activities={dashboardStats?.recentActivities} />
          ) : (
            <ActivityPlaceholder activities={[]} />
          )}
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
