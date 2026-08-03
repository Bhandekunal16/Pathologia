import * as fs from 'fs';
import * as path from 'path';

export interface TemplateDirectoryResolution {
  readonly directory: string;
  readonly source: 'runtime' | 'fallback';
}

/** Resolves the first existing email template directory from known candidates. */
export function resolveTemplateDirectory(
  candidates: ReadonlyArray<string>,
): TemplateDirectoryResolution | null {
  for (const directory of candidates) {
    try {
      if (fs.statSync(directory).isDirectory()) {
        return { directory, source: 'runtime' };
      }
    } catch {
      continue;
    }
  }

  const fallbackDirectory = candidates[0];
  if (!fallbackDirectory) {
    return null;
  }

  return { directory: fallbackDirectory, source: 'fallback' };
}

export function listTemplateFiles(
  directory: string,
): ReadonlySet<string> | null {
  try {
    return new Set(fs.readdirSync(directory));
  } catch {
    return null;
  }
}

export function readTemplateSource(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

export function toTemplateFilePath(
  directory: string,
  templateName: string,
): string {
  return path.join(directory, `${templateName}.hbs`);
}
