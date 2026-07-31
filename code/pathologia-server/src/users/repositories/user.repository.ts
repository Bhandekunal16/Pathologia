import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  CreateUserData,
  IUserRepository,
  PaginatedResult,
  UpdateUserData,
  UserListFilter,
} from './user.repository.interface';
import { Status } from '../../shared/enums/status.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserData): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+password +refreshTokenHash')
      .exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmailOrUsername(
    identifier: string,
  ): Promise<UserDocument | null> {
    const normalized = identifier.toLowerCase();
    return this.userModel
      .findOne({
        $or: [{ email: normalized }, { username: identifier }],
      })
      .select('+password +refreshTokenHash')
      .exec();
  }

  async findAll(
    filter: UserListFilter,
  ): Promise<PaginatedResult<UserDocument>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async updateStatus(id: string, status: Status): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $set: { password: passwordHash } })
      .exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } })
      .exec();
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    if (hash === null) {
      await this.userModel
        .findByIdAndUpdate(id, { $unset: { refreshTokenHash: 1 } })
        .exec();
      return;
    }

    await this.userModel
      .findByIdAndUpdate(id, { $set: { refreshTokenHash: hash } })
      .exec();
  }
}
