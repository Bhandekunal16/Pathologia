import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { AuditLogDocument } from '../schemas/audit-log.schema';

interface PopulatedAuditUser {
  _id: { toString(): string };
  fullName: string;
  email: string;
}

export class AuditLogResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: AuditLogDocument }) => obj._id.toString())
  id: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
    obj.userId?.toString(),
  )
  userId?: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
    obj.user?.fullName,
  )
  userName?: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ obj }: { obj: AuditLogDocument & { user?: PopulatedAuditUser } }) =>
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

  @ApiPropertyOptional()
  @Expose()
  ipAddress?: string;

  @ApiPropertyOptional()
  @Expose()
  userAgent?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromDocument(
    log: AuditLogDocument & { user?: PopulatedAuditUser },
  ): AuditLogResponseDto {
    const dto = new AuditLogResponseDto();
    dto.id = log._id.toString();
    dto.userId = log.userId?.toString();
    dto.userName = log.user?.fullName;
    dto.userEmail = log.user?.email;
    dto.action = log.action;
    dto.entity = log.entity;
    dto.entityId = log.entityId;
    dto.metadata = log.metadata;
    dto.ipAddress = log.ipAddress;
    dto.userAgent = log.userAgent;
    dto.createdAt = log.createdAt;
    return dto;
  }
}
