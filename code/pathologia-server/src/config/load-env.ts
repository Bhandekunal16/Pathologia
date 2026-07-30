import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Loads variables from env.json into process.env.
 * Existing process.env values (e.g. Vercel-injected vars) are not overwritten.
 */
export function loadEnvJson(): void {
  const envPath = resolve(process.cwd(), 'env.json');

  if (!existsSync(envPath)) {
    return;
  }

  const raw = readFileSync(envPath, 'utf-8');
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] !== undefined) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    process.env[key] = String(value);
  }
}

loadEnvJson();
