import { BloodTestTrackingStatus } from '../types/test-booking.types';

export type { BloodTestTrackingStatus };

export const BLOOD_TEST_STATUS_ORDER: BloodTestTrackingStatus[] = [
  'BLOOD_COLLECTED',
  'PROCESSING',
  'PROCESSING_COMPLETED',
  'REPORT_DELIVERED',
];

export const BLOOD_TEST_STATUS_LABELS: Record<BloodTestTrackingStatus, string> = {
  BLOOD_COLLECTED: 'Blood Collected',
  PROCESSING: 'Processing',
  PROCESSING_COMPLETED: 'Processing Completed',
  REPORT_DELIVERED: 'Report Delivered',
};

export function getNextBloodTestStatus(
  current?: BloodTestTrackingStatus,
): BloodTestTrackingStatus | null {
  const currentIndex = current ? BLOOD_TEST_STATUS_ORDER.indexOf(current) : -1;
  return BLOOD_TEST_STATUS_ORDER[currentIndex + 1] ?? null;
}

export function canUploadBloodTestReport(
  status?: BloodTestTrackingStatus,
): boolean {
  return status === 'PROCESSING_COMPLETED' || status === 'REPORT_DELIVERED';
}

export function canDownloadBloodTestReport(
  status?: BloodTestTrackingStatus,
  hasReport?: boolean,
): boolean {
  return canUploadBloodTestReport(status) && !!hasReport;
}

export function isBloodTest(category?: string): boolean {
  return category === 'BLOOD';
}
