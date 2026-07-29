import { AuditAction } from '../../shared/enums/audit-action.enum';

export interface AuditMetadata {
  action: AuditAction;
  entity: string;
  entityIdParam?: string;
  entityIdFromBody?: string;
}
