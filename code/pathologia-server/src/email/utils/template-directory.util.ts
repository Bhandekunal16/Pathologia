import * as fs from 'fs';
import * as path from 'path';

export const DEFAULT_TEMPLATE_EXTENSION = '.hbs' as const;

const TEMPLATE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export type TemplateIoErrorCode =
  'ENOENT' | 'ENOTDIR' | 'EISDIR' | 'EACCES' | 'EPERM' | 'UNKNOWN';

function isExpectedFsErrorCode(code: TemplateIoErrorCode): boolean {
  return code === 'ENOENT' || code === 'ENOTDIR' || code === 'EISDIR';
}

export interface TemplateIoError {
  readonly code: TemplateIoErrorCode;
  readonly message: string;
  readonly path: string;
  readonly expected: boolean;
  readonly cause?: NodeJS.ErrnoException;
}

export class InvalidTemplateNameError extends Error {
  readonly templateName: string;
  readonly reason: string;

  constructor(templateName: string, reason: string) {
    super(`Invalid template name "${templateName}": ${reason}`);
    this.name = 'InvalidTemplateNameError';
    this.templateName = templateName;
    this.reason = reason;
  }
}

export interface TemplateDirectoryResolution {
  readonly directory: string;
  readonly source: 'runtime' | 'fallback';
}

export interface TemplateIoDiagnostics {
  readonly errors: TemplateIoError[];
}

export interface TemplateFilesystem {
  statSync(filePath: string): fs.Stats;
  readdirSync(directory: string): readonly string[];
  readFileSync(filePath: string, encoding: BufferEncoding): string;
}

export interface TemplateDirectoryOptions {
  readonly filesystem?: TemplateFilesystem;
  readonly extension?: string;
  readonly diagnostics?: TemplateIoDiagnostics;
}

export interface TemplateDirectoryResolutionDetails {
  readonly resolution: TemplateDirectoryResolution | null;
  readonly errors: readonly TemplateIoError[];
}

export const nodeTemplateFilesystem: TemplateFilesystem = {
  statSync: (filePath: string): fs.Stats => fs.statSync(filePath),
  readdirSync: (directory: string): readonly string[] =>
    fs.readdirSync(directory),
  readFileSync: (filePath: string, encoding: BufferEncoding): string =>
    fs.readFileSync(filePath, encoding),
};

function resolveOptions(options?: TemplateDirectoryOptions): Required<
  Pick<TemplateDirectoryOptions, 'filesystem' | 'extension'>
> & {
  diagnostics: TemplateIoDiagnostics | undefined;
} {
  return {
    filesystem: options?.filesystem ?? nodeTemplateFilesystem,
    extension: normalizeTemplateExtension(
      options?.extension ?? DEFAULT_TEMPLATE_EXTENSION,
    ),
    diagnostics: options?.diagnostics,
  };
}

function normalizeTemplateExtension(extension: string): string {
  const trimmed = extension.trim();
  if (!trimmed) {
    throw new RangeError('Template extension must be a non-empty string');
  }
  if (
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('..')
  ) {
    throw new RangeError(`Unsafe template extension: ${extension}`);
  }
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

function toErrnoException(error: unknown): NodeJS.ErrnoException | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as NodeJS.ErrnoException).code === 'string'
  ) {
    return error as NodeJS.ErrnoException;
  }
  return undefined;
}

function classifyFsError(error: unknown, filePath: string): TemplateIoError {
  const cause = toErrnoException(error);
  const rawCode = cause?.code;
  const code: TemplateIoErrorCode =
    rawCode === 'ENOENT' ||
    rawCode === 'ENOTDIR' ||
    rawCode === 'EISDIR' ||
    rawCode === 'EACCES' ||
    rawCode === 'EPERM'
      ? rawCode
      : 'UNKNOWN';

  return {
    code,
    message: cause?.message ?? String(error),
    path: filePath,
    expected: isExpectedFsErrorCode(code),
    cause,
  };
}

function recordDiagnostic(
  diagnostics: TemplateIoDiagnostics | undefined,
  error: TemplateIoError,
): void {
  diagnostics?.errors.push(error);
}

function safeStatSync(
  filesystem: TemplateFilesystem,
  filePath: string,
  diagnostics: TemplateIoDiagnostics | undefined,
): fs.Stats | null {
  try {
    return filesystem.statSync(filePath);
  } catch (error) {
    const classified = classifyFsError(error, filePath);
    if (!classified.expected) {
      recordDiagnostic(diagnostics, classified);
    }
    return null;
  }
}

function safeReaddirSync(
  filesystem: TemplateFilesystem,
  directory: string,
  diagnostics: TemplateIoDiagnostics | undefined,
): readonly string[] | null {
  try {
    return filesystem.readdirSync(directory);
  } catch (error) {
    const classified = classifyFsError(error, directory);
    recordDiagnostic(diagnostics, classified);
    return null;
  }
}

function safeReadFileSync(
  filesystem: TemplateFilesystem,
  filePath: string,
  diagnostics: TemplateIoDiagnostics | undefined,
): string | null {
  try {
    return filesystem.readFileSync(filePath, 'utf8');
  } catch (error) {
    const classified = classifyFsError(error, filePath);
    recordDiagnostic(diagnostics, classified);
    return null;
  }
}

export function isPathInsideDirectory(
  parentDirectory: string,
  childPath: string,
): boolean {
  const resolvedParent = path.resolve(parentDirectory);
  const resolvedChild = path.resolve(childPath);
  const relativePath = path.relative(resolvedParent, resolvedChild);

  if (relativePath === '') {
    return true;
  }

  return (
    !relativePath.startsWith(`..${path.sep}`) &&
    relativePath !== '..' &&
    !path.isAbsolute(relativePath)
  );
}

export function assertValidTemplateName(templateName: string): void {
  if (!templateName) {
    throw new InvalidTemplateNameError(templateName, 'name must not be empty');
  }

  if (path.isAbsolute(templateName)) {
    throw new InvalidTemplateNameError(
      templateName,
      'absolute paths are not allowed',
    );
  }

  if (
    templateName.includes('..') ||
    templateName.includes('/') ||
    templateName.includes('\\')
  ) {
    throw new InvalidTemplateNameError(
      templateName,
      'path separators and traversal segments are not allowed',
    );
  }

  if (!TEMPLATE_NAME_PATTERN.test(templateName)) {
    throw new InvalidTemplateNameError(
      templateName,
      'name must start with a letter or digit and contain only letters, digits, ".", "_", or "-"',
    );
  }
}

export function resolveTemplateDirectory(
  candidates: ReadonlyArray<string>,
  options?: TemplateDirectoryOptions,
): TemplateDirectoryResolution | null {
  return resolveTemplateDirectoryWithDiagnostics(candidates, options)
    .resolution;
}

export function resolveTemplateDirectoryWithDiagnostics(
  candidates: ReadonlyArray<string>,
  options?: TemplateDirectoryOptions,
): TemplateDirectoryResolutionDetails {
  const { filesystem, diagnostics } = resolveOptions(options);
  const localErrors: TemplateIoError[] = [];
  const collector = diagnostics ?? { errors: localErrors };

  for (const directory of candidates) {
    const stats = safeStatSync(filesystem, directory, collector);
    if (stats?.isDirectory()) {
      return {
        resolution: { directory, source: 'runtime' },
        errors: collector.errors,
      };
    }
  }

  const fallbackDirectory = candidates[0];
  if (!fallbackDirectory) {
    return { resolution: null, errors: collector.errors };
  }

  return {
    resolution: { directory: fallbackDirectory, source: 'fallback' },
    errors: collector.errors,
  };
}

export function listTemplateFiles(
  directory: string,
  options?: TemplateDirectoryOptions,
): ReadonlySet<string> | null {
  const { filesystem, diagnostics } = resolveOptions(options);
  const entries = safeReaddirSync(filesystem, directory, diagnostics);
  return entries === null ? null : new Set(entries);
}

export function readTemplateSource(
  filePath: string,
  options?: TemplateDirectoryOptions,
): string | null {
  const { filesystem, diagnostics } = resolveOptions(options);
  return safeReadFileSync(filesystem, filePath, diagnostics);
}

export function toTemplateFilePath(
  directory: string,
  templateName: string,
  options?: Pick<TemplateDirectoryOptions, 'extension'>,
): string {
  assertValidTemplateName(templateName);

  const extension = normalizeTemplateExtension(
    options?.extension ?? DEFAULT_TEMPLATE_EXTENSION,
  );
  const fileName = `${templateName}${extension}`;
  const resolvedDirectory = path.resolve(directory);
  const resolvedFilePath = path.resolve(resolvedDirectory, fileName);

  if (!isPathInsideDirectory(resolvedDirectory, resolvedFilePath)) {
    throw new InvalidTemplateNameError(
      templateName,
      'resolved path escapes the template directory',
    );
  }

  return resolvedFilePath;
}
