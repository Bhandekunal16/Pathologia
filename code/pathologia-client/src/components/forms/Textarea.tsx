import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-foreground-secondary">
            {label} {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full p-3 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-foreground-subtle shadow-card focus:outline-hidden focus:ring-2 focus-ring focus:border-accent disabled:bg-surface-sunken disabled:cursor-not-allowed transition-all',
            error ? 'border-danger focus-ring focus:border-danger' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-foreground-muted">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
