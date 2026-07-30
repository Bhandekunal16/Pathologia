import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from '../../shared/enums/status.enum';
import { PathologyTest, PathologyTestDocument } from '../schemas/pathology-test.schema';
import {
  CreatePathologyTestData,
  IPathologyTestRepository,
  PaginatedResult,
  PathologyTestListFilter,
  UpdatePathologyTestData,
} from './pathology-test.repository.interface';

@Injectable()
export class PathologyTestRepository implements IPathologyTestRepository {
  constructor(
    @InjectModel(PathologyTest.name)
    private readonly pathologyTestModel: Model<PathologyTestDocument>,
  ) {}

  async create(data: CreatePathologyTestData): Promise<PathologyTestDocument> {
    const test = new this.pathologyTestModel({
      ...data,
      code: data.code.toUpperCase(),
      rate: data.rate ?? 0,
      status: data.status ?? Status.ACTIVE,
    });
    return test.save();
  }

  async findById(id: string): Promise<PathologyTestDocument | null> {
    return this.pathologyTestModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<PathologyTestDocument | null> {
    return this.pathologyTestModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async findByIds(ids: string[]): Promise<PathologyTestDocument[]> {
    return this.pathologyTestModel.find({ _id: { $in: ids } }).exec();
  }

  async findAll(
    filter: PathologyTestListFilter,
  ): Promise<PaginatedResult<PathologyTestDocument>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { specimenType: searchRegex },
        { description: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      this.pathologyTestModel
        .find(query)
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.pathologyTestModel.countDocuments(query).exec(),
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
    data: UpdatePathologyTestData,
  ): Promise<PathologyTestDocument | null> {
    const updateData = { ...data };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    return this.pathologyTestModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pathologyTestModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
