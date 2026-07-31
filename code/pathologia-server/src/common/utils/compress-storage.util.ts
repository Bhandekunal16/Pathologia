import { gunzipSync, gzipSync } from 'zlib';

const MAX_REPORT_BYTES = 5 * 1024 * 1024;
export const MAX_REPORT_SIZE_BYTES = MAX_REPORT_BYTES;

export function compressForStorage(buffer: Buffer): string {
  return gzipSync(buffer).toString('base64');
}

export function decompressFromStorage(encoded: string): Buffer {
  return gunzipSync(Buffer.from(encoded, 'base64'));
}

export function validateReportSize(buffer: Buffer): void {
  if (buffer.length > MAX_REPORT_BYTES)
    throw new Error(
      `Report file must be smaller than ${MAX_REPORT_BYTES / 1024 / 1024}MB`,
    );
}
