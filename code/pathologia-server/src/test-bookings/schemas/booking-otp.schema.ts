import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingOtpDocument = HydratedDocument<BookingOtp>;

@Schema({ timestamps: true, collection: 'booking_otps' })
export class BookingOtp {
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  patientEmail: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  pathologistId: Types.ObjectId;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop()
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const BookingOtpSchema = SchemaFactory.createForClass(BookingOtp);
