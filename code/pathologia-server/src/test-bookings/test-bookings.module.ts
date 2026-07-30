import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';
import { PathologyTestsModule } from '../pathology-tests/pathology-tests.module';
import { UsersModule } from '../users/users.module';
import { TestBookingsController } from './controllers/test-bookings.controller';
import { BookingOtpRepository } from './repositories/booking-otp.repository';
import { TestBookingRepository } from './repositories/test-booking.repository';
import { BookingOtp, BookingOtpSchema } from './schemas/booking-otp.schema';
import { TestBooking, TestBookingSchema } from './schemas/test-booking.schema';
import { TestBookingsService } from './services/test-bookings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestBooking.name, schema: TestBookingSchema },
      { name: BookingOtp.name, schema: BookingOtpSchema },
    ]),
    UsersModule,
    PathologyTestsModule,
    EmailModule,
    AuditModule,
  ],
  controllers: [TestBookingsController],
  providers: [TestBookingsService, TestBookingRepository, BookingOtpRepository],
  exports: [TestBookingsService],
})
export class TestBookingsModule {}
