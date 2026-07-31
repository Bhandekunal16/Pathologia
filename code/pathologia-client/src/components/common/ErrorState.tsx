import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-danger-muted/50 border border-danger-border rounded-xl my-4">
      <div className="p-3 bg-danger-muted/80 rounded-full text-danger mb-3">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-semibold text-danger">{title}</h3>
      <p className="mt-1 text-xs text-danger max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-danger bg-surface border border-danger-border rounded-lg hover:bg-danger-muted shadow-card transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
