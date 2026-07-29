import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, User, KeyRound, Stethoscope, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const QuickActions: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Actions</h3>
      <p className="text-xs text-slate-500 mb-4">Frequently used features and shortcuts</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isAdmin && (
          <>
            <Link
              to="/users/new"
              className="flex items-center space-x-3 p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-teal-900 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-teal-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Add New User</div>
                <div className="text-[10px] text-teal-700">Create pathologist or admin</div>
              </div>
            </Link>

            <Link
              to="/users"
              className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-white shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Manage Users</div>
                <div className="text-[10px] text-slate-500">Edit, activate, reset passwords</div>
              </div>
            </Link>
          </>
        )}

        <Link
          to="/profile"
          className="flex items-center space-x-3 p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-purple-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Update Profile</div>
            <div className="text-[10px] text-purple-700">Edit info & clinical details</div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="flex items-center space-x-3 p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-amber-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Security Settings</div>
            <div className="text-[10px] text-amber-700">Change workspace password</div>
          </div>
        </Link>
      </div>
    </div>
  );
};
