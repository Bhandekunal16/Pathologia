import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingOtp, BookingOtpDocument } from '../schemas/booking-otp.schema';

export interface CreateBookingOtpData {
  patientEmail: string;
  patientUserId: string;
  pathologistId: string;
  otpHash: string;
  expiresAt: Date;
}

@Injectable()
export class BookingOtpRepository {
  constructor(
    @InjectModel(BookingOtp.name)
    private readonly bookingOtpModel: Model<BookingOtpDocument>,
  ) {}

  async upsertForPatient(data: CreateBookingOtpData): Promise<BookingOtpDocument> {
    return this.bookingOtpModel
      .findOneAndUpdate(
        {
          patientEmail: data.patientEmail,
          pathologistId: data.pathologistId,
        },
        {
          $set: {
            patientUserId: data.patientUserId,
            otpHash: data.otpHash,
            expiresAt: data.expiresAt,
            verifiedAt: undefined,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findLatest(
    patientEmail: string,
    pathologistId: string,
  ): Promise<BookingOtpDocument | null> {
    return this.bookingOtpModel
      .findOne({ patientEmail: patientEmail.toLowerCase(), pathologistId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markVerified(id: string): Promise<void> {
    await this.bookingOtpModel
      .findByIdAndUpdate(id, { $set: { verifiedAt: new Date() } })
      .exec();
  }
}
