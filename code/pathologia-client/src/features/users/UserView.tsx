import React from 'react';
import { Mail, User as UserIcon, Calendar, Building, Award, Clock } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
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
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header Banner */}
      <div className="h-24 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 pt-6" />

      {/* Avatar & Key Info */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-6 gap-4">
          <div className="flex items-end space-x-4">
            <Avatar
              name={user.fullName}
              src={user.avatarUrl}
              size="xl"
              className="border-4 border-white shadow-md"
            />
            <div className="pb-1">
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <p className="text-xs text-slate-500 font-medium">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Edit User
              </button>
            )}
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <Mail className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</div>
              <div className="text-xs font-medium text-slate-800">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <UserIcon className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Username</div>
              <div className="text-xs font-medium text-slate-800">{user.username}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <Building className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Department</div>
              <div className="text-xs font-medium text-slate-800">
                {user.department || 'General Pathology'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <Award className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Specialization</div>
              <div className="text-xs font-medium text-slate-800">
                {user.specialization || 'Clinical Diagnostics'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <Clock className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Last Active Login</div>
              <div className="text-xs font-medium text-slate-800">{formatDate(user.lastLogin)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Account Created</div>
              <div className="text-xs font-medium text-slate-800">{formatDate(user.createdAt)}</div>
            </div>
          </div>
        </div>

        {onBack && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
