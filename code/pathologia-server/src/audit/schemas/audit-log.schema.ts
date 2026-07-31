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
  userId?: Types.ObjectId;

  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ required: true })
  entity: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop()
  hostname?: string;

  @Prop()
  userAgent?: string;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

const indexes: IndexDefinition[] = [
  { userId: 1 },
  { action: 1 },
  { createdAt: -1 },
];

indexes.forEach((index) => AuditLogSchema.index(index));
