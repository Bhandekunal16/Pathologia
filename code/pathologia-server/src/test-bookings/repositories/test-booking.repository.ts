import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingStatus } from '../../shared/enums/booking-status.enum';
import { TestBooking, TestBookingDocument } from '../schemas/test-booking.schema';
import {
  CreateTestBookingData,
  ITestBookingRepository,
  PaginatedResult,
  TestBookingListFilter,
  UpdateTestBookingData,
} from './test-booking.repository.interface';

@Injectable()
export class TestBookingRepository implements ITestBookingRepository {
  constructor(
    @InjectModel(TestBooking.name)
    private readonly testBookingModel: Model<TestBookingDocument>,
  ) {}

  async create(data: CreateTestBookingData): Promise<TestBookingDocument> {
    const booking = new this.testBookingModel({
      ...data,
      status: BookingStatus.CONFIRMED,
    });
    return booking.save();
  }

  async findById(id: string): Promise<TestBookingDocument | null> {
    return this.testBookingModel.findById(id).exec();
  }

  async findAll(
    filter: TestBookingListFilter,
  ): Promise<PaginatedResult<TestBookingDocument>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.patientUserId) {
      query.patientUserId = filter.patientUserId;
    }

    if (filter.bookedByUserId) {
      query.bookedByUserId = filter.bookedByUserId;
    }

    if (filter.pathologistId) {
      query.$or = [
        { bookedByUserId: filter.pathologistId },
        { $expr: { $eq: ['$patientUserId', '$bookedByUserId'] } },
      ];
    }

    const [items, total] = await Promise.all([
      this.testBookingModel
        .find(query)
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.testBookingModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async update(
    id: string,
    data: UpdateTestBookingData,
  ): Promise<TestBookingDocument | null> {
    const updateData: Record<string, unknown> = {};
    if (data.tests) updateData.tests = data.tests;
    if (data.scheduledAt) updateData.scheduledAt = data.scheduledAt;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.testBookingModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<TestBookingDocument | null> {
    return this.testBookingModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
  }
}
