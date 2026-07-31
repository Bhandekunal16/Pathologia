import type { Request } from 'express';

export function getRequestHostname(request?: Request): string | undefined {
  if (!request) return undefined;

  const forwardedHost = request.headers['x-forwarded-host'];

  if (typeof forwardedHost === 'string' && forwardedHost.trim())
    return forwardedHost.split(',')[0]?.trim().split(':')[0];

  if (request.hostname) return request.hostname;

  const hostHeader = request.headers.host;

  if (typeof hostHeader === 'string' && hostHeader.trim())
    return hostHeader.split(':')[0];

  return undefined;
}
