import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, User, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const actionLinkClass =
  'flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-muted hover:bg-surface-sunken text-foreground transition-colors group';

export const QuickActions: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
      <h3 className="text-sm font-bold text-foreground mb-1">Quick Actions</h3>
      <p className="text-xs text-foreground-muted mb-4">Frequently used features and shortcuts</p>

      {isAdmin && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Admin</p>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/users/new" className={actionLinkClass}>
              <div className="p-2 rounded-lg accent-glass">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Add New User</div>
                <div className="text-xs text-foreground-muted">Create pathologist or admin</div>
              </div>
            </Link>

            <Link to="/users" className={actionLinkClass}>
              <div className="sidebar-icon-tile">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Manage Users</div>
                <div className="text-xs text-foreground-muted">Edit, activate, reset passwords</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Account</p>
        <div className="grid grid-cols-1 gap-3">
          <Link to="/profile" className={actionLinkClass}>
            <div className="p-2 rounded-lg accent-glass">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Update Profile</div>
              <div className="text-xs text-foreground-muted">Edit info & clinical details</div>
            </div>
          </Link>

          <Link to="/profile?tab=security" className={actionLinkClass}>
            <div className="sidebar-icon-tile-active">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Security Settings</div>
              <div className="text-xs text-foreground-muted">Change workspace password</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
