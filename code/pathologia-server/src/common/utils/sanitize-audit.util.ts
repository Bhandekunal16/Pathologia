const SENSITIVE_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'refreshToken',
  'accessToken',
  'refreshTokenHash',
]);

export function sanitizeAuditPayload(
  value: unknown,
): Record<string, unknown> | unknown[] | unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditPayload(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '***';
      continue;
    }

    if (entry && typeof entry === 'object') {
      sanitized[key] = sanitizeAuditPayload(entry);
      continue;
    }

    sanitized[key] = entry;
  }

  return sanitized;
}
