import React, { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useTestBookings } from '../hooks/useTestBookings';
import {
  BloodTestTrackingPanel,
  buildReportUploadPayload,
} from '../features/test-booking/BloodTestTrackingPanel';
import { TestBooking } from '../types/test-booking.types';
import { isBloodTest } from '../utils/bloodTestTracking';
import { formatDate } from '../utils/formatters';
import { cn } from '../lib/utils';

export const BloodTestTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const isPathologist = user?.role === 'PATHOLOGIST';
  const [page, setPage] = useState(1);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const {
    bookingsData,
    isLoadingBookings,
    updateBloodTestTracking,
    isUpdatingTracking,
    uploadBloodTestReport,
    isUploadingReport,
  } = useTestBookings({ page, limit: 20, status: 'CONFIRMED' });

  const bloodTestEntries = useMemo(() => {
    const entries: { booking: TestBooking; testItemId: string; key: string }[] = [];
    for (const booking of bookingsData?.items ?? []) {
      for (const test of booking.tests) {
        if (isBloodTest(test.category)) {
          entries.push({
            booking,
            testItemId: test.id,
            key: `${booking.id}-${test.id}`,
          });
        }
      }
    }
    return entries;
  }, [bookingsData?.items]);

  const handleAdvanceStatus = async (
    booking: TestBooking,
    testItemId: string,
    status: Parameters<typeof updateBloodTestTracking>[0]['payload']['status'],
  ) => {
    await updateBloodTestTracking({
      bookingId: booking.id,
      testItemId,
      payload: { status },
    });
  };

  const handleUploadReport = async (
    booking: TestBooking,
    testItemId: string,
    file: File,
  ) => {
    const payload = await buildReportUploadPayload(file);
    await uploadBloodTestReport({ bookingId: booking.id, testItemId, payload });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Test Tracking"
        description={
          isPathologist
            ? 'Monitor blood test progress, update statuses, and upload reports for patients.'
            : 'Track your blood test progress and download reports when available.'
        }
        action={
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            <Activity className="w-4 h-4" />
            Live Tracking
          </div>
        }
      />

      {isLoadingBookings ? (
        <p className="text-sm text-slate-500">Loading blood tests...</p>
      ) : bloodTestEntries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">No blood test bookings found</p>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed bookings with blood tests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bloodTestEntries.map(({ booking, testItemId, key }) => {
            const test = booking.tests.find((t) => t.id === testItemId)!;
            const isExpanded = expandedKey === key;

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{test.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {booking.patientName ?? 'Patient'} · {formatDate(booking.scheduledAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0',
                      test.trackingStatus
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {test.trackingStatus?.replace(/_/g, ' ') ?? 'Not started'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <BloodTestTrackingPanel
                      booking={booking}
                      test={test}
                      isPathologist={isPathologist}
                      isUpdating={isUpdatingTracking}
                      isUploading={isUploadingReport}
                      onAdvanceStatus={(status) =>
                        handleAdvanceStatus(booking, testItemId, status)
                      }
                      onUploadReport={(file) =>
                        handleUploadReport(booking, testItemId, file)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(bookingsData?.totalPages ?? 1) > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 self-center">
            Page {page} of {bookingsData?.totalPages ?? 1}
          </span>
          <button
            type="button"
            disabled={page >= (bookingsData?.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
