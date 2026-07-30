import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BloodTestTrackingStatus } from '../../shared/enums/blood-test-tracking-status.enum';
import { TestCategory } from '../../shared/enums/test-category.enum';

@Schema()
export class BookedTestItem {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  testId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ type: String, enum: TestCategory, default: TestCategory.OTHER })
  category: TestCategory;

  @Prop({ required: true, min: 0 })
  rate: number;

  @Prop({ type: String, enum: BloodTestTrackingStatus })
  trackingStatus?: BloodTestTrackingStatus;

  @Prop()
  bloodCollectedAt?: Date;

  @Prop()
  processingAt?: Date;

  @Prop()
  processingCompletedAt?: Date;

  @Prop()
  reportDeliveredAt?: Date;

  @Prop()
  statusUpdatedAt?: Date;

  @Prop()
  reportData?: string;

  @Prop()
  reportMimeType?: string;

  @Prop()
  reportFileName?: string;

  @Prop()
  reportUploadedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reportUploadedBy?: Types.ObjectId;
}

export const BookedTestItemSchema = SchemaFactory.createForClass(BookedTestItem);
