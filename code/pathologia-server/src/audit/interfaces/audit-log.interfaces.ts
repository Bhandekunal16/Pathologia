import { Types } from 'mongoose';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { AuditLogResponseDto } from '../dto/audit-log-response.dto';
import { AuditLogDocument } from '../schemas/audit-log.schema';

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

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedAuditLogResult {
  items: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PopulatedAuditUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
}

export interface PopulatedAuditLog extends AuditLogDocument {
  user?: PopulatedAuditUser;
}

export interface AuditLogFacetAggregation {
  items: PopulatedAuditLog[];
  total: Array<{ count: number }>;
}
