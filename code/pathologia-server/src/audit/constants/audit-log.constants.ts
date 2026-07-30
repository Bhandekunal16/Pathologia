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

export const {
  AUDIT_LOG_FIELDS,
  USER_PROJECTION,
  MAX_RECENT_LIMIT,
  DEFAULT_RECENT_LIMIT,
  MAX_LIMIT,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  USERS_COLLECTION,
} = config;

export const RECENT_FIELDS = AUDIT_LOG_FIELDS;
export const DETAIL_FIELDS = AUDIT_LOG_FIELDS;
