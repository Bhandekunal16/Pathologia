import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'teal' | 'emerald' | 'rose' | 'amber' | 'blue';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'teal',
  className,
}) => {
  const colorStyles = {
    teal: {
      border: 'border-accent-muted/80',
      bgIcon: 'bg-accent-subtle text-accent',
      badge: 'text-accent bg-accent-subtle',
    },
    emerald: {
      border: 'border-success-border/80',
      bgIcon: 'bg-success-muted text-success',
      badge: 'text-success bg-success-muted',
    },
    rose: {
      border: 'border-danger-border/80',
      bgIcon: 'bg-danger-muted text-danger',
      badge: 'text-danger bg-danger-muted',
    },
    amber: {
      border: 'border-warning-border/80',
      bgIcon: 'bg-warning-muted text-warning',
      badge: 'text-warning bg-warning-muted',
    },
    blue: {
      border: 'border-info-border/80',
      bgIcon: 'bg-info-muted text-info',
      badge: 'text-info bg-info-muted',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={cn(
        'bg-surface rounded-xl border p-5 shadow-card hover:shadow-card transition-all duration-200',
        style.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl border border-border-subtle', style.bgIcon)}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
              trend.isPositive ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>}
    </div>
  );
};
