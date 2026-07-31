import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, IndexDefinition, Types } from 'mongoose';
import { AuditAction } from '../../shared/enums/audit-action.enum';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'audit_logs',
})
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  public readonly userId?: Types.ObjectId;

  @Prop({ type: String, enum: AuditAction, required: true })
  public readonly action: AuditAction;

  @Prop({ required: true })
  public readonly entity: string;

  @Prop()
  public readonly entityId?: string;

  @Prop({ type: Object })
  public readonly metadata?: Record<string, unknown>;

  @Prop()
  public readonly hostname?: string;

  @Prop()
  public readonly userAgent?: string;

  public readonly createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

const indexes: IndexDefinition[] = [
  { userId: 1 },
  { action: 1 },
  { createdAt: -1 },
];

indexes.forEach((index) => AuditLogSchema.index(index));
