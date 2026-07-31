import React from 'react';
import { testBookingsApi } from '../../api/test-bookings.api';
import { BookedTestItem, TestBooking } from '../../types/test-booking.types';
import { BloodTestTrackingStatus } from '../../utils/bloodTestTracking';
import { BloodTestTimeline } from './BloodTestTimeline';

interface BloodTestTrackingPanelProps {
  booking: TestBooking;
  test: BookedTestItem;
  isPathologist?: boolean;
  isUpdating?: boolean;
  isUploading?: boolean;
  onAdvanceStatus: (status: BloodTestTrackingStatus) => Promise<void>;
  onUploadReport: (file: File) => Promise<void>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export const BloodTestTrackingPanel: React.FC<BloodTestTrackingPanelProps> = ({
  booking,
  test,
  isPathologist = false,
  isUpdating = false,
  isUploading = false,
  onAdvanceStatus,
  onUploadReport,
}) => {
  const handleDownload = async () => {
    const blob = await testBookingsApi.downloadBloodTestReport(booking.id, test.id);
    triggerDownload(blob, test.reportFileName ?? `${test.code}_report.pdf`);
  };

  const handleUpload = async (file: File) => {
    await onUploadReport(file);
  };

  return (
    <div className="rounded-xl border border-border p-4 bg-surface">
      <div className="mb-4">
        <p className="text-sm font-bold text-foreground">{test.name}</p>
        <p className="text-xs text-foreground-muted">{test.code}</p>
      </div>
      <BloodTestTimeline
        test={test}
        isPathologist={isPathologist}
        isUpdating={isUpdating}
        isUploading={isUploading}
        onAdvanceStatus={(status) => void onAdvanceStatus(status)}
        onUploadReport={(file) => void handleUpload(file)}
        onDownloadReport={() => void handleDownload()}
      />
    </div>
  );
};

export async function buildReportUploadPayload(file: File) {
  const data = await fileToBase64(file);
  return {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    data,
  };
}
