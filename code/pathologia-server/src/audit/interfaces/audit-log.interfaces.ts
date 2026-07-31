import { Types } from 'mongoose';
import { AuditAction } from '../../shared/enums/audit-action.enum';

export interface CreateAuditLogData {
  readonly userId?: string;
  readonly action: AuditAction;
  readonly entity: string;
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly hostname?: string;
  readonly userAgent?: string;
}

export interface AuditLogFilter {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly action?: AuditAction;
}

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly skip: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface PopulatedAuditUserRecord {
  readonly _id: Types.ObjectId;
  readonly fullName: string;
  readonly email: string;
}

export interface AuditLogRecord {
  readonly _id: Types.ObjectId;
  readonly userId?: Types.ObjectId;
  readonly user?: PopulatedAuditUserRecord;
  readonly action: AuditAction;
  readonly entity: string;
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly hostname?: string;
  readonly userAgent?: string;
  readonly createdAt: Date;
}

export interface AuditLogFacetAggregation {
  readonly items: AuditLogRecord[];
  readonly total: ReadonlyArray<{ readonly count: number }>;
}
