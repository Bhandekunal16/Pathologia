import { BookedTestItem, TestBooking } from '../types/test-booking.types';

export interface BackendBookedTestItem {
  testId: string;
  name: string;
  code: string;
  rate: number;
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
    testId: item.testId,
    name: item.name,
    code: item.code,
    rate: item.rate,
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
