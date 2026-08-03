import { SMTP_RETRY_CONFIG } from '../constants/email.constants';

export function calculateRetryDelayMs(attempt: number): number {
  const delay =
    SMTP_RETRY_CONFIG.baseDelayMs * Math.pow(2, Math.max(attempt - 1, 0));

  return Math.min(delay, SMTP_RETRY_CONFIG.maxDelayMs);
}

export function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
