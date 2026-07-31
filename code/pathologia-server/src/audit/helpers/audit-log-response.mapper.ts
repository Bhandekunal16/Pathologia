import { AuditLogResponseDto } from '../dto/audit-log-response.dto';
import { AuditLogRecord } from '../interfaces/audit-log.interfaces';
import {
  objectIdToString,
  optionalObjectIdToString,
} from './audit-log-id.util';

export function mapAuditLogRecordToResponseDto(
  record: AuditLogRecord,
): AuditLogResponseDto {
  return new AuditLogResponseDto({
    id: objectIdToString(record._id),
    userId: optionalObjectIdToString(record.userId),
    userName: record.user?.fullName,
    userEmail: record.user?.email,
    action: record.action,
    entity: record.entity,
    entityId: record.entityId,
    metadata: record.metadata,
    hostname: record.hostname,
    userAgent: record.userAgent,
    createdAt: record.createdAt,
  });
}
