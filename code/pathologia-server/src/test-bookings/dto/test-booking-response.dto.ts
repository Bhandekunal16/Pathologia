import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { TestBookingDocument } from '../schemas/test-booking.schema';
import { BookedTestItemResponseDto } from './booked-test-item-response.dto';

export { BookedTestItemResponseDto };

export class TestBookingResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: TestBookingDocument }) => obj._id.toString())
  id: string;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: TestBookingDocument }) => obj.patientUserId.toString())
  patientUserId: string;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: TestBookingDocument }) => obj.bookedByUserId.toString())
  bookedByUserId: string;

  @ApiProperty({ type: [BookedTestItemResponseDto] })
  @Expose()
  tests: BookedTestItemResponseDto[];

  @ApiProperty()
  @Expose()
  scheduledAt: Date;

  @ApiProperty()
  @Expose()
  totalAmount: number;

  @ApiProperty({ enum: BookingStatus })
  @Expose()
  status: BookingStatus;

  @ApiPropertyOptional()
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  patientName?: string;

  @ApiPropertyOptional()
  @Expose()
  patientEmail?: string;

  @ApiPropertyOptional()
  @Expose()
  bookedByName?: string;

  static fromDocument(
    booking: TestBookingDocument,
    extras?: {
      patientName?: string;
      patientEmail?: string;
      bookedByName?: string;
    },
  ): TestBookingResponseDto {
    const dto = new TestBookingResponseDto();
    dto.id = booking._id.toString();
    dto.patientUserId = booking.patientUserId.toString();
    dto.bookedByUserId = booking.bookedByUserId.toString();
    dto.tests = booking.tests.map((item) => BookedTestItemResponseDto.fromItem(item));
    dto.scheduledAt = booking.scheduledAt;
    dto.totalAmount = booking.totalAmount;
    dto.status = booking.status;
    dto.notes = booking.notes;
    dto.createdAt = booking.createdAt;
    dto.updatedAt = booking.updatedAt;
    dto.patientName = extras?.patientName;
    dto.patientEmail = extras?.patientEmail;
    dto.bookedByName = extras?.bookedByName;
    return dto;
  }
}
