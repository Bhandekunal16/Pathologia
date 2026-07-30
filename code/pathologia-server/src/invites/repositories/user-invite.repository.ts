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

@Injectable()
export class UserInviteRepository {
  constructor(
    @InjectModel(UserInvite.name)
    private readonly userInviteModel: Model<UserInviteDocument>,
  ) {}

  async create(data: CreateUserInviteData): Promise<UserInviteDocument> {
    const invite = new this.userInviteModel({
      ...data,
      invitedBy: new Types.ObjectId(data.invitedBy),
      status: InviteStatus.PENDING,
    });
    return invite.save();
  }

  async findByTokenHash(tokenHash: string): Promise<UserInviteDocument | null> {
    return this.userInviteModel.findOne({ tokenHash }).exec();
  }

  async findPendingByEmail(email: string): Promise<UserInviteDocument | null> {
    return this.userInviteModel
      .findOne({ email: email.toLowerCase(), status: InviteStatus.PENDING })
      .exec();
  }

  async updateById(
    id: string,
    data: Partial<Pick<UserInvite, 'tokenHash' | 'status' | 'expiresAt' | 'acceptedAt'>>,
  ): Promise<UserInviteDocument | null> {
    return this.userInviteModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }
}
