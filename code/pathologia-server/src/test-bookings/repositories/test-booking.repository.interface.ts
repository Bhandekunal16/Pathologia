import { TestBookingDocument } from '../schemas/test-booking.schema';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { BookedTestItem } from '../schemas/booked-test-item.schema';

export interface UpdateTestBookingData {
  tests?: BookedTestItem[];
  scheduledAt?: Date;
  totalAmount?: number;
  notes?: string;
}

export interface TestBookingListFilter {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  patientUserId?: string;
  bookedByUserId?: string;
  /** Pathologist view: own bookings + user self-bookings */
  pathologistId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTestBookingData {
  patientUserId: string;
  bookedByUserId: string;
  tests: BookedTestItem[];
  scheduledAt: Date;
  totalAmount: number;
  notes?: string;
}

export interface ITestBookingRepository {
  create(data: CreateTestBookingData): Promise<TestBookingDocument>;
  findById(id: string): Promise<TestBookingDocument | null>;
  findAll(filter: TestBookingListFilter): Promise<PaginatedResult<TestBookingDocument>>;
  update(id: string, data: UpdateTestBookingData): Promise<TestBookingDocument | null>;
  updateStatus(id: string, status: BookingStatus): Promise<TestBookingDocument | null>;
}
