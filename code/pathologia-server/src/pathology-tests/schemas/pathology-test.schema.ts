import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { Status } from '../../shared/enums/status.enum';

export type PathologyTestDocument = HydratedDocument<PathologyTest>;

@Schema({ timestamps: true, collection: 'pathology_tests' })
export class PathologyTest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ type: String, enum: TestCategory, required: true, index: true })
  category: TestCategory;

  @Prop({ required: true, trim: true })
  specimenType: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, trim: true })
  manual: string;

  @Prop({ type: String, enum: Status, required: true, default: Status.ACTIVE, index: true })
  status: Status;
}

export const PathologyTestSchema = SchemaFactory.createForClass(PathologyTest);
