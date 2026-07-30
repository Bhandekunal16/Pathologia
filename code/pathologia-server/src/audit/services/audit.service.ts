import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { AuditLogResponseDto } from '../dto/audit-log-response.dto';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

export interface CreateAuditLogData {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  hostname?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  page?: number;
  limit?: number;
  search?: string;
  action?: AuditAction;
}

interface PopulatedAuditLog extends AuditLogDocument {
  user?: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
  };
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(data: CreateAuditLogData): Promise<void> {
    await this.auditLogModel.create({
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      metadata: data.metadata,
      hostname: data.hostname,
      userAgent: data.userAgent,
    });
  }

  async findAll(filter: AuditLogFilter) {
    const page = Math.max(filter.page ?? 1, 1);
    const limit = Math.min(Math.max(filter.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    const matchStage: Record<string, unknown> = {};
    if (filter.action) {
      matchStage.action = filter.action;
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.fullName': searchRegex },
            { 'user.email': searchRegex },
            { entity: searchRegex },
            { entityId: searchRegex },
            { action: searchRegex },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    );

    const [result] = await this.auditLogModel.aggregate<{
      items: PopulatedAuditLog[];
      total: Array<{ count: number }>;
    }>(pipeline);

    const total = result?.total[0]?.count ?? 0;

    return {
      items: (result?.items ?? []).map((log) => AuditLogResponseDto.fromDocument(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findRecent(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const result = await this.findAll({ page: 1, limit: safeLimit });
    return result.items;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Audit log not found');
    }

    const [log] = await this.auditLogModel.aggregate<PopulatedAuditLog>([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return AuditLogResponseDto.fromDocument(log);
  }
}
