import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BookedTestItem {
  @Prop({ required: true })
  testId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, min: 0 })
  rate: number;
}

export const BookedTestItemSchema = SchemaFactory.createForClass(BookedTestItem);
