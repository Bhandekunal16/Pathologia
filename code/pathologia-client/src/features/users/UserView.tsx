import React from 'react';
import { Mail, User as UserIcon, Calendar, Building, Award, Clock } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/common/RoleBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { User } from '../../types/auth.types';

interface UserViewProps {
  user: User;
  onEdit?: () => void;
  onBack?: () => void;
}

export const UserView: React.FC<UserViewProps> = ({ user, onEdit, onBack }) => {
  const showDepartment =
    user.role === 'ADMIN' || (user.role === 'PATHOLOGIST' && Boolean(user.department));
  const showSpecialization = user.role === 'PATHOLOGIST' && Boolean(user.specialization);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
      {/* Header Banner */}
      <div className="h-24 bg-gradient-to-r from-accent-hover via-accent-hover to-sidebar px-6 pt-6" />

      {/* Avatar & Key Info */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-6 gap-4">
          <div className="flex items-end space-x-4">
            <Avatar
              name={user.fullName}
              src={user.avatarUrl}
              size="xl"
              className="border-4 border-surface shadow-md"
            />
            <div className="pb-1">
              <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
              <p className="text-xs text-foreground-muted font-medium">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
            {onEdit && (
              <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
                Edit User
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-subtle pt-6">
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
            <Mail className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Email Address</div>
              <div className="text-xs font-medium text-foreground">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
            <UserIcon className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Username</div>
              <div className="text-xs font-medium text-foreground">{user.username}</div>
            </div>
          </div>

          {showDepartment && (
            <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
              <Building className="w-5 h-5 text-accent shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Department</div>
                <div className="text-xs font-medium text-foreground">{user.department}</div>
              </div>
            </div>
          )}

          {showSpecialization && (
            <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
              <Award className="w-5 h-5 text-accent shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Specialization</div>
                <div className="text-xs font-medium text-foreground">{user.specialization}</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
            <Clock className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Last Active Login</div>
              <div className="text-xs font-medium text-foreground">{formatDate(user.lastLogin)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-surface-sunken/70 border border-border-subtle">
            <Calendar className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-foreground-subtle uppercase">Account Created</div>
              <div className="text-xs font-medium text-foreground">{formatDate(user.createdAt)}</div>
            </div>
          </div>
        </div>

        {onBack && (
          <div className="mt-6 flex justify-end">
            <Button type="button" variant="secondary" size="md" onClick={onBack}>
              Back to List
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
