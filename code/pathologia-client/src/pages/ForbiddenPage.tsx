import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-700 mb-4 shadow-2xs">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 - Access Denied</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-md leading-relaxed">
        You do not have administrative permissions to view or modify this area. If you require access, please contact your chief pathologist or system administrator.
      </p>

      <div className="mt-6 flex items-center space-x-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
