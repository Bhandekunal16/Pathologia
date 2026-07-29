const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export const env = {
  apiBaseUrl,
  isDev: import.meta.env.DEV,
} as const;
