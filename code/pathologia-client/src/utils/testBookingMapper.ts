import { BookedTestItem, TestBooking } from '../types/test-booking.types';

export interface BackendBookedTestItem {
  id: string;
  testId: string;
  name: string;
  code: string;
  category?: string;
  rate: number;
  trackingStatus?: string;
  bloodCollectedAt?: string;
  processingAt?: string;
  processingCompletedAt?: string;
  reportDeliveredAt?: string;
  statusUpdatedAt?: string;
  reportFileName?: string;
  reportMimeType?: string;
  reportUploadedAt?: string;
  hasReport?: boolean;
}

export interface BackendTestBooking {
  id: string;
  patientUserId: string;
  bookedByUserId: string;
  tests: BackendBookedTestItem[];
  scheduledAt: string;
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  patientEmail?: string;
  bookedByName?: string;
}

function mapBookedTestItem(item: BackendBookedTestItem): BookedTestItem {
  return {
    id: item.id,
    testId: item.testId,
    name: item.name,
    code: item.code,
    category: item.category as BookedTestItem['category'],
    rate: item.rate,
    trackingStatus: item.trackingStatus as BookedTestItem['trackingStatus'],
    bloodCollectedAt: item.bloodCollectedAt,
    processingAt: item.processingAt,
    processingCompletedAt: item.processingCompletedAt,
    reportDeliveredAt: item.reportDeliveredAt,
    statusUpdatedAt: item.statusUpdatedAt,
    reportFileName: item.reportFileName,
    reportMimeType: item.reportMimeType,
    reportUploadedAt: item.reportUploadedAt,
    hasReport: item.hasReport ?? false,
  };
}

export function mapTestBookingFromApi(booking: BackendTestBooking): TestBooking {
  return {
    id: booking.id,
    patientUserId: booking.patientUserId,
    bookedByUserId: booking.bookedByUserId,
    tests: booking.tests.map(mapBookedTestItem),
    scheduledAt: booking.scheduledAt,
    totalAmount: booking.totalAmount,
    status: booking.status as TestBooking['status'],
    notes: booking.notes,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    patientName: booking.patientName,
    patientEmail: booking.patientEmail,
    bookedByName: booking.bookedByName,
  };
}
