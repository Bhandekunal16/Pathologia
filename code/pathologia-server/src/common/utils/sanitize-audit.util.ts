const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'refreshtoken',
  'accesstoken',
  'refreshtokenhash',
  'authorization',
  'apikey',
  'secret',
  'clientsecret',
  'privatekey',
  'token',
  'otp',
  'verificationcode',
]);

const REDACTED = '***';
const CIRCULAR = '[Circular]';

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

function isTypedArray(value: object): boolean {
  return ArrayBuffer.isView(value) && !Array.isArray(value);
}

function isBuffer(value: object): boolean {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(value);
}

function shouldPreserve(value: object): boolean {
  return (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Error ||
    isTypedArray(value) ||
    isBuffer(value)
  );
}

function sanitizeValue(
  value: unknown,
  seen: WeakSet<object>,
  cache: WeakMap<object, unknown>,
): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value !== 'object') return value;

  if (seen.has(value)) return CIRCULAR;

  const cached = cache.get(value);
  if (cached !== undefined) return cached;

  if (shouldPreserve(value)) return value;

  if (value instanceof Map) {
    seen.add(value);
    const sanitized: Record<string, unknown> = {};
    cache.set(value, sanitized);

    try {
      for (const [key, entry] of value) {
        if (typeof key !== 'string') {
          continue;
        }

        sanitized[key] = isSensitiveKey(key)
          ? REDACTED
          : sanitizeValue(entry, seen, cache);
      }

      return sanitized;
    } finally {
      seen.delete(value);
    }
  }

  if (value instanceof Set) {
    seen.add(value);
    const sanitized: unknown[] = [];
    cache.set(value, sanitized);

    try {
      for (const entry of value) {
        sanitized.push(sanitizeValue(entry, seen, cache));
      }

      return sanitized;
    } finally {
      seen.delete(value);
    }
  }

  if (Array.isArray(value)) {
    seen.add(value);
    const sanitized: unknown[] = [];
    cache.set(value, sanitized);

    try {
      for (let index = 0; index < value.length; index++) {
        sanitized[index] = sanitizeValue(value[index], seen, cache);
      }

      return sanitized;
    } finally {
      seen.delete(value);
    }
  }

  seen.add(value);
  const sanitized: Record<string, unknown> = {};
  cache.set(value, sanitized);

  try {
    for (const [key, entry] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = REDACTED;
        continue;
      }

      sanitized[key] = sanitizeValue(entry, seen, cache);
    }

    return sanitized;
  } finally {
    seen.delete(value);
  }
}

export function sanitizeAuditPayload(value: unknown): unknown {
  return sanitizeValue(value, new WeakSet(), new WeakMap());
}
