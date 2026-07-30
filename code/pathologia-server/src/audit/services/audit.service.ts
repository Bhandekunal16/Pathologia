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

  public log(data: CreateAuditLogData): void {
    const document = {
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      metadata: data.metadata,
      hostname: data.hostname,
      userAgent: data.userAgent,
      ...(data.userId &&
        Types.ObjectId.isValid(data.userId) && {
          userId: new Types.ObjectId(data.userId),
        }),
    };

    void this.auditLogModel.create(document).catch((error) => {
      console.error('Failed to create audit log', error);
    });
  }

  public async findAll(filter: AuditLogFilter) {
    const page = Math.max(filter.page ?? 1, 1);
    const limit = Math.min(Math.max(filter.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};

    if (filter.action) match.action = filter.action;

    if (filter.search) {
      const escaped = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      match.$or = [{ entity: regex }, { entityId: regex }, { action: regex }];
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$userId'] } },
            },
            { $project: { fullName: 1, email: 1 } },
          ],
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
    ];

    const [items, total] = await Promise.all([
      this.auditLogModel.aggregate<PopulatedAuditLog>(pipeline).exec(),
      this.auditLogModel.countDocuments(match).exec(),
    ]);

    return {
      items: items.map((item) => AuditLogResponseDto.fromDocument(item)),
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }

  public async findRecent(limit = 5): Promise<AuditLogResponseDto[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const fields = {
      action: 1,
      entity: 1,
      entityId: 1,
      metadata: 1,
      hostname: 1,
      userAgent: 1,
      createdAt: 1,
      userId: 1,
    };

    const logs = await this.auditLogModel
      .find({}, fields)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .populate({
        path: 'userId',
        select: 'fullName email',
        options: { lean: true },
      })
      .lean()
      .exec();

    return logs.map((log) => AuditLogResponseDto.fromDocument(log));
  }

  public async findById(id: string): Promise<AuditLogResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Audit log not found');
    }

    const fields = {
      action: 1,
      entity: 1,
      entityId: 1,
      metadata: 1,
      hostname: 1,
      userAgent: 1,
      createdAt: 1,
      userFullName: 1,
      userEmail: 1,
    };

    const log = await this.auditLogModel
      .findById(id)
      .select(fields)
      .lean()
      .exec();

    if (!log) throw new NotFoundException('Audit log not found');

    return AuditLogResponseDto.fromDocument(log);
  }
}
