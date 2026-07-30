export const USERS_COLLECTION = 'users';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const DEFAULT_RECENT_LIMIT = 5;
export const MAX_RECENT_LIMIT = 20;

/** Core audit log fields returned by read queries. */
export const AUDIT_LOG_FIELDS = {
  _id: 1,
  userId: 1,
  action: 1,
  entity: 1,
  entityId: 1,
  metadata: 1,
  hostname: 1,
  userAgent: 1,
  createdAt: 1,
} as const;

/** User fields joined via $lookup. */
export const USER_PROJECTION = {
  fullName: 1,
  email: 1,
} as const;

/** Projection for recent audit log widgets. */
export const RECENT_FIELDS = AUDIT_LOG_FIELDS;

/** Projection for single audit log detail views. */
export const DETAIL_FIELDS = AUDIT_LOG_FIELDS;
