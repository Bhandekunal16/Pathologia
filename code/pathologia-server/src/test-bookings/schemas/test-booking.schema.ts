import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { BookedTestItem, BookedTestItemSchema } from './booked-test-item.schema';

export type TestBookingDocument = HydratedDocument<TestBooking>;

@Schema({ timestamps: true, collection: 'test_bookings' })
export class TestBooking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  bookedByUserId: Types.ObjectId;

  @Prop({ type: [BookedTestItemSchema], required: true })
  tests: BookedTestItem[];

  @Prop({ required: true, index: true })
  scheduledAt: Date;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: BookingStatus, required: true, default: BookingStatus.CONFIRMED, index: true })
  status: BookingStatus;

  @Prop({ trim: true })
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const TestBookingSchema = SchemaFactory.createForClass(TestBooking);
