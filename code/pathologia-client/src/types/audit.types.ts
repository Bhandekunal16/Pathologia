export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGE'
  | 'USER_ACTIVATE'
  | 'USER_DEACTIVATE';

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  search: string;
  action: string;
}
