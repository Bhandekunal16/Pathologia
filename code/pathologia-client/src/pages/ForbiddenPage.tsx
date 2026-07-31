import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-admin-muted border border-admin-border rounded-2xl text-admin mb-4 shadow-card">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">403 - Access Denied</h1>
      <p className="mt-2 text-xs text-foreground-muted max-w-md leading-relaxed">
        You do not have administrative permissions to view or modify this area. If you require access, please contact your chief pathologist or system administrator.
      </p>

      <div className="mt-6">
        <Button type="button" size="md" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    </div>
  );
};
