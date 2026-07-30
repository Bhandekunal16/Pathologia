import { AuditLog } from '../types/audit.types';
import { RecentActivity } from '../types/user.types';

const ACTION_LABELS: Record<AuditLog['action'], string> = {
  LOGIN: 'User logged in',
  LOGOUT: 'User logged out',
  USER_CREATE: 'User account created',
  USER_UPDATE: 'User account updated',
  USER_DELETE: 'User account deleted',
  PASSWORD_RESET: 'Password reset by admin',
  PASSWORD_CHANGE: 'Password changed',
  USER_ACTIVATE: 'User account activated',
  USER_DEACTIVATE: 'User account deactivated',
  USER_INVITE: 'User invitation sent',
  USER_REGISTER: 'User self-registered via invite',
  TEST_BOOKING_CREATE: 'Test booking created',
  TEST_BOOKING_UPDATE: 'Test booking updated',
  TEST_BOOKING_CANCEL: 'Test booking cancelled',
  TEST_BOOKING_OTP_SEND: 'Booking OTP sent to patient',
  BLOOD_TEST_STATUS_UPDATE: 'Blood test status updated',
  BLOOD_TEST_REPORT_UPLOAD: 'Blood test report uploaded',
};

const ACTION_TYPES: Record<AuditLog['action'], RecentActivity['type']> = {
  LOGIN: 'login',
  LOGOUT: 'login',
  USER_CREATE: 'user_management',
  USER_UPDATE: 'user_management',
  USER_DELETE: 'user_management',
  PASSWORD_RESET: 'security',
  PASSWORD_CHANGE: 'security',
  USER_ACTIVATE: 'user_management',
  USER_DEACTIVATE: 'user_management',
  USER_INVITE: 'user_management',
  USER_REGISTER: 'user_management',
  TEST_BOOKING_CREATE: 'user_management',
  TEST_BOOKING_UPDATE: 'user_management',
  TEST_BOOKING_CANCEL: 'user_management',
  TEST_BOOKING_OTP_SEND: 'security',
  BLOOD_TEST_STATUS_UPDATE: 'user_management',
  BLOOD_TEST_REPORT_UPLOAD: 'user_management',
};

export function formatAuditAction(action: AuditLog['action']): string {
  return ACTION_LABELS[action] ?? action;
}

export function mapAuditLogToRecentActivity(log: AuditLog): RecentActivity {
  return {
    id: log.id,
    user: log.userName || log.userEmail || 'System',
    action: formatAuditAction(log.action),
    timestamp: log.createdAt,
    type: ACTION_TYPES[log.action] ?? 'system',
  };
}

export function getAuditRequestSummary(log: AuditLog): string {
  const metadata = log.metadata as
    | {
        request?: { method?: string; path?: string };
        method?: string;
        path?: string;
      }
    | undefined;

  const method = metadata?.request?.method ?? metadata?.method;
  const path = metadata?.request?.path ?? metadata?.path;

  if (method && path) {
    return `${method} ${path}`;
  }

  return `${log.entity}${log.entityId ? ` #${log.entityId}` : ''}`;
}

export function getAuditRequestPayload(log: AuditLog): Record<string, unknown> {
  const metadata = (log.metadata ?? {}) as Record<string, unknown>;
  const request = (metadata.request as Record<string, unknown> | undefined) ?? {};

  return {
    method: request.method ?? metadata.method ?? 'N/A',
    path: request.path ?? metadata.path ?? 'N/A',
    body: request.body ?? null,
    hostname: log.hostname ?? null,
    userAgent: log.userAgent ?? null,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId ?? null,
    performedBy: log.userName
      ? { name: log.userName, email: log.userEmail ?? null }
      : null,
    timestamp: log.createdAt,
  };
}

export function getAuditResponsePayload(log: AuditLog): Record<string, unknown> {
  const metadata = (log.metadata ?? {}) as Record<string, unknown>;
  const response = (metadata.response as Record<string, unknown> | undefined) ?? {};

  if (Object.keys(response).length > 0) {
    return response;
  }

  return {
    success: true,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId ?? null,
    timestamp: log.createdAt,
  };
}
