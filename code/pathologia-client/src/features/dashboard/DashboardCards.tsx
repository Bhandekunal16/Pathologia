import React from 'react';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Skeleton } from '../../components/common/Skeleton';
import { DashboardStats } from '../../types/user.types';

interface DashboardCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Users"
        value={stats?.totalUsers || 0}
        subtitle="Registered system accounts"
        icon={<Users className="w-5 h-5 text-accent" />}
        trend={{ value: '+12% this month', isPositive: true }}
        color="teal"
      />

      <StatCard
        title="Active Users"
        value={stats?.activeUsers || 0}
        subtitle="Currently active pathologists & staff"
        icon={<UserCheck className="w-5 h-5 text-success" />}
        trend={{ value: '100% operational', isPositive: true }}
        color="emerald"
      />

      <StatCard
        title="Inactive Users"
        value={stats?.inactiveUsers || 0}
        subtitle="Suspended or deactivated accounts"
        icon={<UserX className="w-5 h-5 text-danger" />}
        color="rose"
      />
    </div>
  );
};
