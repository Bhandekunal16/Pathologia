import { AuditAction } from '../../shared/enums/audit-action.enum';

export interface AuditMetadata {
  readonly action: AuditAction;
  readonly entity: string;
  readonly entityIdParam?: string;
  readonly entityIdFromBody?: string;
}
