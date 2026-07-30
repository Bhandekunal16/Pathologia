export enum BloodTestTrackingStatus {
  BLOOD_COLLECTED = 'BLOOD_COLLECTED',
  PROCESSING = 'PROCESSING',
  PROCESSING_COMPLETED = 'PROCESSING_COMPLETED',
  REPORT_DELIVERED = 'REPORT_DELIVERED',
}

export const BLOOD_TEST_STATUS_ORDER: BloodTestTrackingStatus[] = [
  BloodTestTrackingStatus.BLOOD_COLLECTED,
  BloodTestTrackingStatus.PROCESSING,
  BloodTestTrackingStatus.PROCESSING_COMPLETED,
  BloodTestTrackingStatus.REPORT_DELIVERED,
];
