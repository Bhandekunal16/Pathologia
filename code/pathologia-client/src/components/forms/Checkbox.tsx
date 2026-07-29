import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              'h-4 w-4 rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
