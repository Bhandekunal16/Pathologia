import React, { useRef } from 'react';
import { Check, Clock, Upload } from 'lucide-react';
import { BookedTestItem } from '../../types/test-booking.types';
import { formatDate } from '../../utils/formatters';
import {
  BLOOD_TEST_STATUS_LABELS,
  BLOOD_TEST_STATUS_ORDER,
  BloodTestTrackingStatus,
  canDownloadBloodTestReport,
  canUploadBloodTestReport,
  getNextBloodTestStatus,
} from '../../utils/bloodTestTracking';
import { cn } from '../../lib/utils';

interface BloodTestTimelineProps {
  test: BookedTestItem;
  isPathologist?: boolean;
  isUpdating?: boolean;
  isUploading?: boolean;
  onAdvanceStatus?: (status: BloodTestTrackingStatus) => void;
  onUploadReport?: (file: File) => void;
  onDownloadReport?: () => void;
}

function getStatusTimestamp(
  test: BookedTestItem,
  status: BloodTestTrackingStatus,
): string | undefined {
  switch (status) {
    case 'BLOOD_COLLECTED':
      return test.bloodCollectedAt;
    case 'PROCESSING':
      return test.processingAt;
    case 'PROCESSING_COMPLETED':
      return test.processingCompletedAt;
    case 'REPORT_DELIVERED':
      return test.reportDeliveredAt;
    default:
      return undefined;
  }
}

function isStatusComplete(
  test: BookedTestItem,
  status: BloodTestTrackingStatus,
): boolean {
  if (!test.trackingStatus) return false;
  const currentIndex = BLOOD_TEST_STATUS_ORDER.indexOf(test.trackingStatus);
  const statusIndex = BLOOD_TEST_STATUS_ORDER.indexOf(status);
  return currentIndex >= statusIndex;
}

export const BloodTestTimeline: React.FC<BloodTestTimelineProps> = ({
  test,
  isPathologist = false,
  isUpdating = false,
  isUploading = false,
  onAdvanceStatus,
  onUploadReport,
  onDownloadReport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextStatus = getNextBloodTestStatus(test.trackingStatus);
  const showUpload = canUploadBloodTestReport(test.trackingStatus);
  const showDownload = canDownloadBloodTestReport(test.trackingStatus, test.hasReport);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadReport) {
      onUploadReport(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-4">
        {BLOOD_TEST_STATUS_ORDER.map((status, index) => {
          const complete = isStatusComplete(test, status);
          const timestamp = getStatusTimestamp(test, status);
          const isLast = index === BLOOD_TEST_STATUS_ORDER.length - 1;

          return (
            <div key={status} className="relative">
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[-18px] top-5 w-0.5 h-[calc(100%+8px)]',
                    complete ? 'bg-teal-500' : 'bg-slate-200',
                  )}
                />
              )}
              <div className="absolute left-[-24px] top-1">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2',
                    complete
                      ? 'bg-teal-600 border-teal-600'
                      : 'bg-white border-slate-300',
                  )}
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      complete ? 'text-slate-900' : 'text-slate-400',
                    )}
                  >
                    {BLOOD_TEST_STATUS_LABELS[status]}
                  </p>
                  {complete && timestamp ? (
                    <p className="text-[11px] text-teal-700 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {formatDate(timestamp)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {test.hasReport && test.reportFileName && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <p className="font-semibold text-slate-800">📄 {test.reportFileName}</p>
          {test.reportUploadedAt && (
            <p className="text-slate-500 mt-1">Uploaded {formatDate(test.reportUploadedAt)}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {isPathologist && nextStatus && onAdvanceStatus && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onAdvanceStatus(nextStatus)}
            className="px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : `Mark as ${BLOOD_TEST_STATUS_LABELS[nextStatus]}`}
          </button>
        )}

        {showUpload && isPathologist && onUploadReport && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </>
        )}

        {showDownload && onDownloadReport && (
          <button
            type="button"
            onClick={onDownloadReport}
            className="px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-800 hover:bg-teal-100"
          >
            Download Report
          </button>
        )}
      </div>
    </div>
  );
};
