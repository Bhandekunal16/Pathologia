import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Activity, FlaskConical } from 'lucide-react';
import { useTestBookings } from '../../hooks/useTestBookings';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Skeleton } from '../../components/common/Skeleton';

export const NonAdminDashboardWidgets: React.FC = () => {
  const { bookingsData, isLoadingBookings } = useTestBookings({ page: 1, limit: 5 });

  const upcomingBooking = bookingsData?.items?.find(
    (b) => b.status === 'CONFIRMED' && new Date(b.scheduledAt) > new Date(),
  );

  if (isLoadingBookings) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Link
        to="/test-booking"
        className="bg-surface rounded-xl border border-accent-muted p-5 shadow-card hover:shadow-card transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Book Tests</span>
          <div className="p-2 rounded-lg bg-accent-subtle text-accent group-hover:bg-accent-muted transition-colors">
            <FlaskConical className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-foreground">Schedule a new appointment</p>
        <p className="text-xs text-foreground-muted mt-1">Browse catalog and add tests to cart</p>
      </Link>

      <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Next Appointment</span>
          <div className="p-2 rounded-lg bg-surface-sunken text-foreground-muted">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        {upcomingBooking ? (
          <>
            <p className="mt-3 text-sm font-bold text-foreground">
              {formatDate(upcomingBooking.scheduledAt)}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {upcomingBooking.tests.length} test(s) · {formatCurrency(upcomingBooking.totalAmount)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-foreground-muted">No upcoming bookings</p>
        )}
      </div>

      <Link
        to="/blood-test-tracking"
        className="bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-card transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Tracking</span>
          <div className="p-2 rounded-lg bg-surface-sunken text-foreground-muted group-hover:bg-surface-sunken transition-colors">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-foreground">Blood test status</p>
        <p className="text-xs text-foreground-muted mt-1">View collection and report progress</p>
      </Link>
    </div>
  );
};
