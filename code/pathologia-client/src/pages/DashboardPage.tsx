import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardCards } from '../features/dashboard/DashboardCards';
import { ActivityPlaceholder } from '../features/dashboard/ActivityPlaceholder';
import { QuickActions } from '../features/dashboard/QuickActions';
import { NonAdminDashboardWidgets } from '../features/dashboard/NonAdminDashboardWidgets';
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
          <div className="header-chip">
            <Stethoscope className="w-4 h-4 header-chip-icon" />
            <span>Pathology System Online</span>
          </div>
        }
      />

      {isAdmin ? (
        <DashboardCards stats={dashboardStats} isLoading={isLoadingStats} />
      ) : (
        <NonAdminDashboardWidgets />
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
