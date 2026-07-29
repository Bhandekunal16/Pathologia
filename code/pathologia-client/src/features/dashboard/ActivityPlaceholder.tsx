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
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      case 'profile_update':
        return <ActivityIcon className="w-4 h-4 text-blue-600" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case 'login':
        return <KeyRound className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Audit Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live log of system changes and user actions</p>
        </div>
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Real-time</span>
        </span>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{act.user}</span>
                  <span className="text-[10px] text-slate-400">{formatTimeAgo(act.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{act.action}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
