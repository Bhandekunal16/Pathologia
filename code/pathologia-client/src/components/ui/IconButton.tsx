import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'teal' | 'blue' | 'amber' | 'purple' | 'rose';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'icon-btn-default',
  teal: 'icon-btn-accent',
  blue: 'icon-btn-info',
  amber: 'icon-btn-warning',
  purple: 'icon-btn-admin',
  rose: 'icon-btn-danger',
};

const sizeStyles = {
  sm: 'min-h-9 min-w-9 p-2',
  md: 'min-h-11 min-w-11 p-2.5',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn('icon-btn focus-ring', variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
