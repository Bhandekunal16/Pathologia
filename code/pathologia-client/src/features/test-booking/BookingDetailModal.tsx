import React from 'react';
import { Calendar, FlaskConical, User } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { TestBooking } from '../../types/test-booking.types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface BookingDetailModalProps {
  isOpen: boolean;
  booking: TestBooking | null;
  onClose: () => void;
  onEdit?: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  booking,
  onClose,
  onEdit,
}) => {
  if (!booking) return null;

  const isSelfBooking = booking.patientUserId === booking.bookedByUserId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" maxWidth="lg">
      <div className="px-6 py-4 space-y-5">
        <div className="rounded-xl border border-border bg-surface-sunken/70 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent-muted text-accent">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{booking.patientName ?? 'Patient'}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{booking.patientEmail ?? '—'}</p>
            </div>
            <span
              className={cn(
                'inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0',
                booking.status === 'CONFIRMED'
                  ? 'bg-success-muted text-success'
                  : 'bg-danger-muted text-danger',
              )}
            >
              {booking.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-foreground-muted">Booked By</span>
              <p className="font-semibold text-foreground mt-0.5">
                {isSelfBooking ? 'User (self-booking)' : booking.bookedByName ?? '—'}
              </p>
            </div>
            <div>
              <span className="text-foreground-muted">Booked On</span>
              <p className="font-semibold text-foreground mt-0.5">{formatDate(booking.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-accent-muted bg-accent-subtle/50 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold">Appointment</span>
          </div>
          <p className="text-sm font-bold text-foreground mt-2">{formatDate(booking.scheduledAt)}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-foreground-muted" />
            <h3 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
              Selected Tests ({booking.tests.length})
            </h3>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-surface-sunken text-foreground-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Test</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Code</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {booking.tests.map((test) => (
                  <tr key={test.testId}>
                    <td className="px-4 py-3 font-medium text-foreground">{test.name}</td>
                    <td className="px-4 py-3 text-foreground-muted">{test.code}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(test.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-accent-subtle/60">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-bold text-foreground">
                    Total Amount
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-accent">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {booking.notes && (
          <div className="rounded-xl border border-border bg-surface-sunken p-4">
            <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-xs text-foreground-secondary leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {onEdit && (
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={onEdit}
              className="btn-primary"
            >
              Edit Tests & Timeline
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
