export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface BookedTestItem {
  testId: string;
  name: string;
  code: string;
  rate: number;
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
