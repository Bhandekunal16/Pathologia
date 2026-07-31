import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../../shared/enums/audit-action.enum';

export class AuditLogResponseDto {
  @ApiProperty({ description: 'Audit log identifier' })
  readonly id: string;

  @ApiPropertyOptional({ description: 'Acting user identifier' })
  readonly userId?: string;

  @ApiPropertyOptional({ description: 'Acting user full name when populated' })
  readonly userName?: string;

  @ApiPropertyOptional({ description: 'Acting user email when populated' })
  readonly userEmail?: string;

  @ApiProperty({ enum: AuditAction })
  readonly action: AuditAction;

  @ApiProperty()
  readonly entity: string;

  @ApiPropertyOptional()
  readonly entityId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  readonly metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'localhost' })
  readonly hostname?: string;

  @ApiPropertyOptional()
  readonly userAgent?: string;

  @ApiProperty()
  readonly createdAt: Date;

  constructor(props: AuditLogResponseDto) {
    this.id = props.id;
    this.userId = props.userId;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
    this.action = props.action;
    this.entity = props.entity;
    this.entityId = props.entityId;
    this.metadata = props.metadata;
    this.hostname = props.hostname;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt;
  }
}

export class PaginatedAuditLogsResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  readonly items: AuditLogResponseDto[];

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly totalPages: number;

  constructor(props: PaginatedAuditLogsResponseDto) {
    this.items = props.items;
    this.total = props.total;
    this.page = props.page;
    this.limit = props.limit;
    this.totalPages = props.totalPages;
  }
}
