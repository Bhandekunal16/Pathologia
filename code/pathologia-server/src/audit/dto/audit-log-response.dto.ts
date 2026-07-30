import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { AuditLogDocument } from '../schemas/audit-log.schema';

interface PopulatedAuditUser {
  _id: { toString(): string };
  fullName: string;
  email: string;
}

interface AuditLogSource {
  _id: { toString(): string };
  userId?: { toString(): string };
  user?: PopulatedAuditUser;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  hostname?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class AuditLogResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: AuditLogDocument }) => obj._id.toString())
  id: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(
    ({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
      obj.userId?.toString(),
  )
  userId?: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(
    ({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
      obj.user?.fullName,
  )
  userName?: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(
    ({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
      obj.user?.email,
  )
  userEmail?: string;

  @ApiProperty({ enum: AuditAction })
  @Expose()
  action: AuditAction;

  @ApiProperty()
  @Expose()
  entity: string;

  @ApiPropertyOptional()
  @Expose()
  entityId?: string;

  @ApiPropertyOptional()
  @Expose()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'localhost' })
  @Expose()
  hostname?: string;

  @ApiPropertyOptional()
  @Expose()
  userAgent?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromDocument(log: AuditLogSource): AuditLogResponseDto {
    const dto = new AuditLogResponseDto();
    dto.id = log._id.toString();
    dto.userId = log.userId?.toString();
    dto.userName = log.user?.fullName;
    dto.userEmail = log.user?.email;
    dto.action = log.action;
    dto.entity = log.entity;
    dto.entityId = log.entityId;
    dto.metadata = log.metadata;
    dto.hostname = log.hostname ?? log.ipAddress;
    dto.userAgent = log.userAgent;
    dto.createdAt = log.createdAt;
    return dto;
  }
}
