import React from 'react';
import { Clock, ShieldAlert, UserCheck, KeyRound, Activity as ActivityIcon } from 'lucide-react';
import { RecentActivity } from '../../types/user.types';
import { formatTimeAgo } from '../../utils/formatters';

interface ActivityPlaceholderProps {
  activities?: RecentActivity[];
}

export const ActivityPlaceholder: React.FC<ActivityPlaceholderProps> = ({
  activities = [],
}) => {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_management':
        return <UserCheck className="w-4 h-4 text-accent" />;
      case 'profile_update':
        return <ActivityIcon className="w-4 h-4 text-info" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-admin" />;
      case 'login':
        return <KeyRound className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-foreground-muted" />;
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Audit Activity</h3>
          <p className="text-xs text-foreground-muted mt-0.5">Live log of system changes and user actions</p>
        </div>
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-sunken text-foreground-muted">
          <Clock className="w-3 h-3 text-foreground-subtle" />
          <span>Real-time</span>
        </span>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-foreground-subtle py-4 text-center">No recent activity logged</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-surface-sunken/70 border border-border-subtle hover:bg-surface-sunken transition-colors"
            >
              <div className="p-2 bg-surface rounded-lg border border-border shadow-card shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{act.user}</span>
                  <span className="text-[10px] text-foreground-subtle">{formatTimeAgo(act.timestamp)}</span>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5 truncate">{act.action}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
