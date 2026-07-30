import rawConfig from '../../config/json/audit-log.json';

type MongoProjection = Record<string, 1>;

interface AuditLogJsonConfig {
  AUDIT_LOG_FIELDS: MongoProjection;
  USER_PROJECTION: MongoProjection;
  MAX_RECENT_LIMIT: number;
  DEFAULT_RECENT_LIMIT: number;
  MAX_LIMIT: number;
  DEFAULT_LIMIT: number;
  DEFAULT_PAGE: number;
  USERS_COLLECTION: string;
}

const config = rawConfig as AuditLogJsonConfig;

export const USERS_COLLECTION = config.USERS_COLLECTION;
export const DEFAULT_PAGE = config.DEFAULT_PAGE;
export const DEFAULT_LIMIT = config.DEFAULT_LIMIT;
export const MAX_LIMIT = config.MAX_LIMIT;
export const DEFAULT_RECENT_LIMIT = config.DEFAULT_RECENT_LIMIT;
export const MAX_RECENT_LIMIT = config.MAX_RECENT_LIMIT;
export const AUDIT_LOG_FIELDS = config.AUDIT_LOG_FIELDS;
export const USER_PROJECTION = config.USER_PROJECTION;

export const RECENT_FIELDS = AUDIT_LOG_FIELDS;
export const DETAIL_FIELDS = AUDIT_LOG_FIELDS;
