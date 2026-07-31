import { BadRequestException } from '@nestjs/common';
import { gunzipSync, gzipSync } from 'zlib';

const BYTES_PER_MB = 1024 * 1024;
const DEFAULT_MAX_REPORT_SIZE_BYTES = 5 * BYTES_PER_MB;

function resolveMaxReportSizeBytes(): number {
  const raw = process.env.MAX_REPORT_SIZE_BYTES;
  if (!raw) return DEFAULT_MAX_REPORT_SIZE_BYTES;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_REPORT_SIZE_BYTES;
}

export const MAX_REPORT_SIZE_BYTES = resolveMaxReportSizeBytes();

function formatMaxReportSizeMb(): string {
  return `${MAX_REPORT_SIZE_BYTES / BYTES_PER_MB}MB`;
}

function isValidBase64(value: string): boolean {
  return value.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

function decodeBase64(encoded: string): Buffer {
  const normalized = encoded.trim();

  if (!normalized || !isValidBase64(normalized))
    throw new BadRequestException('Invalid report file encoding');

  return Buffer.from(normalized, 'base64');
}

export function compressForStorage(buffer: Buffer): string {
  validateReportSize(buffer);

  try {
    return gzipSync(buffer).toString('base64');
  } catch {
    throw new BadRequestException('Unable to process report file');
  }
}

export function decompressFromStorage(encoded: string): Buffer {
  try {
    const decompressed = gunzipSync(decodeBase64(encoded));
    validateReportSize(decompressed);
    return decompressed;
  } catch (error) {
    if (error instanceof BadRequestException) throw error;

    throw new BadRequestException('Invalid or corrupted report file');
  }
}

export function validateReportSize(buffer: Buffer): void {
  if (buffer.length > MAX_REPORT_SIZE_BYTES)
    throw new BadRequestException(
      `Report file must be smaller than ${formatMaxReportSizeMb()}`,
    );
}
