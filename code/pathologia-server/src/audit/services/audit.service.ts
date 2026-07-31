import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_RECENT_LIMIT,
  MAX_LIMIT,
  MAX_RECENT_LIMIT,
} from '../constants/audit-log.constants';
import { AuditLogResponseDto } from '../dto/audit-log-response.dto';
import { AuditLogPipelineBuilder } from '../helpers/audit-log-pipeline.builder';
import { mapAuditLogRecordToResponseDto } from '../helpers/audit-log-response.mapper';
import {
  AuditLogFacetAggregation,
  AuditLogFilter,
  AuditLogRecord,
  CreateAuditLogData,
  PaginationParams,
  PaginatedResult,
} from '../interfaces/audit-log.interfaces';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

export type {
  AuditLogFilter,
  CreateAuditLogData,
  PaginatedResult,
} from '../interfaces/audit-log.interfaces';

export type PaginatedAuditLogResult = PaginatedResult<AuditLogResponseDto>;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  public log(data: CreateAuditLogData): void {
    const document = this.buildCreateDocument(data);

    void this.auditLogModel.create(document).catch((error: unknown) => {
      this.handleLogError(data, error);
    });
  }

  public async findAll(
    filter: AuditLogFilter,
  ): Promise<PaginatedAuditLogResult> {
    const pagination = this.resolvePagination(filter);
    const matchFilter = AuditLogPipelineBuilder.buildMatchFilter(filter);
    const pipeline = AuditLogPipelineBuilder.buildPaginatedListPipeline(
      matchFilter,
      pagination.skip,
      pagination.limit,
    );

    const [facetResult] = await this.auditLogModel
      .aggregate<AuditLogFacetAggregation>(pipeline)
      .exec();

    return this.buildPaginatedResult(facetResult, pagination);
  }

  public async findRecent(
    limit = DEFAULT_RECENT_LIMIT,
  ): Promise<readonly AuditLogResponseDto[]> {
    const safeLimit = this.clampRecentLimit(limit);
    const result = await this.findAll({ page: DEFAULT_PAGE, limit: safeLimit });
    return result.items;
  }

  public async findById(id: string): Promise<AuditLogResponseDto> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Audit log not found');

    const pipeline = AuditLogPipelineBuilder.buildDetailPipeline(
      new Types.ObjectId(id),
    );
    const [log] = await this.auditLogModel
      .aggregate<AuditLogRecord>(pipeline)
      .exec();

    if (!log) throw new NotFoundException('Audit log not found');
    return mapAuditLogRecordToResponseDto(log);
  }

  private buildCreateDocument(
    data: CreateAuditLogData,
  ): Record<string, unknown> {
    return {
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
  }

  private handleLogError(data: CreateAuditLogData, error: unknown): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const message = error instanceof Error ? error.message : String(error);

    this.logger.error(
      `Failed to create audit log [action=${data.action}, entity=${data.entity}, userId=${data.userId ?? 'n/a'}]: ${message}`,
      stack,
    );
  }

  private resolvePagination(filter: AuditLogFilter): PaginationParams {
    const page = Math.max(filter.page ?? DEFAULT_PAGE, DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(filter.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private clampRecentLimit(limit: number): number {
    return Math.min(Math.max(limit, 1), MAX_RECENT_LIMIT);
  }

  private buildPaginatedResult(
    facetResult: AuditLogFacetAggregation | undefined,
    pagination: PaginationParams,
  ): PaginatedAuditLogResult {
    const items = this.mapToResponseDtos(facetResult?.items ?? []);
    const total = facetResult?.total[0]?.count ?? 0;
    const { page, limit } = pagination;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return { items, total, page, limit, totalPages };
  }

  private mapToResponseDtos(
    logs: readonly AuditLogRecord[],
  ): AuditLogResponseDto[] {
    return logs.map((log) => mapAuditLogRecordToResponseDto(log));
  }
}
