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
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{booking.patientName ?? 'Patient'}</p>
              <p className="text-xs text-slate-500 mt-0.5">{booking.patientEmail ?? '—'}</p>
            </div>
            <span
              className={cn(
                'inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0',
                booking.status === 'CONFIRMED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700',
              )}
            >
              {booking.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Booked By</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {isSelfBooking ? 'User (self-booking)' : booking.bookedByName ?? '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Booked On</span>
              <p className="font-semibold text-slate-800 mt-0.5">{formatDate(booking.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
          <div className="flex items-center gap-2 text-teal-800">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold">Appointment</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">{formatDate(booking.scheduledAt)}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selected Tests ({booking.tests.length})
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Test</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Code</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.tests.map((test) => (
                  <tr key={test.testId}>
                    <td className="px-4 py-3 font-medium text-slate-800">{test.name}</td>
                    <td className="px-4 py-3 text-slate-500">{test.code}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(test.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-teal-50/60">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-bold text-slate-800">
                    Total Amount
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-teal-700">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {booking.notes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {onEdit && (
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              Edit Tests & Timeline
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
