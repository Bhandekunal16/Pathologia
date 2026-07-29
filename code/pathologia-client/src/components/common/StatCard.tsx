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
      border: 'border-teal-200/80',
      bgIcon: 'bg-teal-50 text-teal-700',
      badge: 'text-teal-700 bg-teal-50',
    },
    emerald: {
      border: 'border-emerald-200/80',
      bgIcon: 'bg-emerald-50 text-emerald-700',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    rose: {
      border: 'border-rose-200/80',
      bgIcon: 'bg-rose-50 text-rose-700',
      badge: 'text-rose-700 bg-rose-50',
    },
    amber: {
      border: 'border-amber-200/80',
      bgIcon: 'bg-amber-50 text-amber-700',
      badge: 'text-amber-700 bg-amber-50',
    },
    blue: {
      border: 'border-blue-200/80',
      bgIcon: 'bg-blue-50 text-blue-700',
      badge: 'text-blue-700 bg-blue-50',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-5 shadow-2xs hover:shadow-xs transition-all duration-200',
        style.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl border border-slate-100', style.bgIcon)}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
