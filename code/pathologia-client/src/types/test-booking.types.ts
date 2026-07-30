export type BookingStatus = 'CONFIRMED' | 'CANCELLED';
export type TestCategory = 'BLOOD' | 'URINE' | 'IMAGING' | 'BODY_CHECKUP' | 'OTHER';

export type BloodTestTrackingStatus =
  | 'BLOOD_COLLECTED'
  | 'PROCESSING'
  | 'PROCESSING_COMPLETED'
  | 'REPORT_DELIVERED';

export interface BookedTestItem {
  id: string;
  testId: string;
  name: string;
  code: string;
  category?: TestCategory;
  rate: number;
  trackingStatus?: BloodTestTrackingStatus;
  bloodCollectedAt?: string;
  processingAt?: string;
  processingCompletedAt?: string;
  reportDeliveredAt?: string;
  statusUpdatedAt?: string;
  reportFileName?: string;
  reportMimeType?: string;
  reportUploadedAt?: string;
  hasReport: boolean;
}

export interface TestBooking {
  id: string;
  patientUserId: string;
  bookedByUserId: string;
  tests: BookedTestItem[];
  scheduledAt: string;
  totalAmount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  patientEmail?: string;
  bookedByName?: string;
}

export interface TestBookingFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateTestBookingPayload {
  testIds?: string[];
  scheduledAt?: string;
  notes?: string;
}

export interface UpdateBloodTestTrackingPayload {
  status: BloodTestTrackingStatus;
}

export interface UploadBloodTestReportPayload {
  fileName: string;
  mimeType: string;
  data: string;
}

export interface CreateTestBookingPayload {
  testIds: string[];
  scheduledAt: string;
  notes?: string;
  patientEmail?: string;
  otp?: string;
}

export interface SendBookingOtpPayload {
  patientEmail: string;
}

export interface SendBookingOtpResult {
  patientEmail: string;
  patientName: string;
  expiresAt: string;
  message: string;
}
