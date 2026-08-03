import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InviteStatus } from '../../shared/enums/invite-status.enum';
import { UserInvite, UserInviteDocument } from '../schemas/user-invite.schema';

export interface CreateUserInviteData {
  email: string;
  tokenHash: string;
  invitedBy: string;
  expiresAt: Date;
}

export const UPDATABLE_INVITE_FIELDS = [
  'tokenHash',
  'status',
  'expiresAt',
  'acceptedAt',
] as const satisfies readonly (keyof UserInvite)[];

type UpdatableUserInviteField = (typeof UPDATABLE_INVITE_FIELDS)[number];

export type UpdateUserInviteData = Partial<
  Pick<UserInvite, UpdatableUserInviteField>
>;

const FIND_BY_ID_AND_UPDATE_OPTIONS = {
  new: true,
  runValidators: true,
} as const;

function normalizeInviteEmail(email: string): string {
  return email.toLowerCase().trim();
}

function isValidObjectId(value: string): boolean {
  if (!Types.ObjectId.isValid(value)) {
    return false;
  }

  return new Types.ObjectId(value).toString() === value;
}

function pickDefinedUpdateFields(
  data: UpdateUserInviteData,
): Partial<Pick<UserInvite, UpdatableUserInviteField>> {
  const update: Partial<Pick<UserInvite, UpdatableUserInviteField>> = {};
  if (data.tokenHash !== undefined) update.tokenHash = data.tokenHash;
  if (data.status !== undefined) update.status = data.status;
  if (data.expiresAt !== undefined) update.expiresAt = data.expiresAt;
  if (data.acceptedAt !== undefined) update.acceptedAt = data.acceptedAt;
  return update;
}

@Injectable()
export class UserInviteRepository {
  constructor(
    @InjectModel(UserInvite.name)
    private readonly userInviteModel: Model<UserInviteDocument>,
  ) {}

  public async create(data: CreateUserInviteData): Promise<UserInviteDocument> {
    return this.userInviteModel.create({
      email: normalizeInviteEmail(data.email),
      tokenHash: data.tokenHash,
      invitedBy: new Types.ObjectId(data.invitedBy),
      expiresAt: data.expiresAt,
      status: InviteStatus.PENDING,
    });
  }

  public async findByTokenHash(
    tokenHash: string,
  ): Promise<UserInviteDocument | null> {
    return this.userInviteModel.findOne({ tokenHash }).exec();
  }

  public async findPendingByEmail(
    email: string,
  ): Promise<UserInviteDocument | null> {
    return this.userInviteModel
      .findOne({
        email: normalizeInviteEmail(email),
        status: InviteStatus.PENDING,
      })
      .exec();
  }

  public async updateById(
    id: string,
    data: UpdateUserInviteData,
  ): Promise<UserInviteDocument | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const update = pickDefinedUpdateFields(data);
    if (Object.keys(update).length === 0) {
      return this.userInviteModel.findById(id).exec();
    }

    return this.userInviteModel
      .findByIdAndUpdate(id, { $set: update }, FIND_BY_ID_AND_UPDATE_OPTIONS)
      .exec();
  }
}
