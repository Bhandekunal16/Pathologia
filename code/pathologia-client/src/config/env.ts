const LOCAL_API_URL = 'http://localhost:3000';
const PRODUCTION_API_URL = 'https://pathologia-server.vercel.app';

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return LOCAL_API_URL;
    }

    if (hostname.endsWith('.vercel.app')) {
      return PRODUCTION_API_URL;
    }
  }

  return import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  isDev: import.meta.env.DEV,
  isLocalhost:
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0'),
} as const;
