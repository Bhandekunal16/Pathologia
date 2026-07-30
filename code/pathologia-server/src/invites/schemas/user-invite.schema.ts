import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InviteStatus } from '../../shared/enums/invite-status.enum';

export type UserInviteDocument = HydratedDocument<UserInvite>;

@Schema({ timestamps: true, collection: 'user_invites' })
export class UserInvite {
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, unique: true, index: true })
  tokenHash: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  invitedBy: Types.ObjectId;

  @Prop({ type: String, enum: InviteStatus, required: true, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop()
  acceptedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserInviteSchema = SchemaFactory.createForClass(UserInvite);

UserInviteSchema.index({ email: 1, status: 1 });
