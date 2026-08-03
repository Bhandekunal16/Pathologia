import { SMTP_RETRY_CONFIG } from '../constants/email.constants';

const MIN_POSITIVE_ATTEMPT = 1;
const MAX_EXPONENT_SAFE_FOR_MULTIPLY = 53;

const DEFAULT_RETRY_DELAY_OPTIONS: Readonly<{
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: JitterStrategy;
}> = {
  baseDelayMs: SMTP_RETRY_CONFIG.baseDelayMs,
  maxDelayMs: SMTP_RETRY_CONFIG.maxDelayMs,
  jitter: 'none',
};

function assertPositiveInteger(value: number, argumentName: string): void {
  if (!Number.isInteger(value) || value < MIN_POSITIVE_ATTEMPT)
    throw new RangeError(
      `${argumentName} must be a positive integer, received ${String(value)}`,
    );
}

function assertNonNegativeFiniteNumber(
  value: number,
  argumentName: string,
): void {
  if (!Number.isFinite(value) || value < 0)
    throw new RangeError(
      `${argumentName} must be a finite, non-negative number, received ${String(value)}`,
    );
}

function assertValidJitterStrategy(
  value: string,
): asserts value is JitterStrategy {
  if (value !== 'none' && value !== 'full' && value !== 'equal') {
    throw new RangeError(
      `jitter must be one of "none", "full", or "equal", received ${value}`,
    );
  }
}

function resolveRetryDelayOptions(
  options?: RetryDelayOptions,
): Readonly<Required<RetryDelayOptions>> {
  const baseDelayMs =
    options?.baseDelayMs ?? DEFAULT_RETRY_DELAY_OPTIONS.baseDelayMs;
  const maxDelayMs =
    options?.maxDelayMs ?? DEFAULT_RETRY_DELAY_OPTIONS.maxDelayMs;
  const jitter = options?.jitter ?? DEFAULT_RETRY_DELAY_OPTIONS.jitter;

  assertNonNegativeFiniteNumber(baseDelayMs, 'baseDelayMs');
  assertNonNegativeFiniteNumber(maxDelayMs, 'maxDelayMs');
  assertValidJitterStrategy(jitter);

  if (maxDelayMs < baseDelayMs)
    throw new RangeError(
      `maxDelayMs (${maxDelayMs}) must be greater than or equal to baseDelayMs (${baseDelayMs})`,
    );

  return { baseDelayMs, maxDelayMs, jitter };
}

function calculateBoundedExponentialDelayMs(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  if (maxDelayMs === 0) return 0;
  const exponent = attempt - 1;
  if (exponent >= MAX_EXPONENT_SAFE_FOR_MULTIPLY) return maxDelayMs;
  const exponentialDelay = baseDelayMs * 2 ** exponent;
  if (!Number.isFinite(exponentialDelay)) return maxDelayMs;
  return Math.min(exponentialDelay, maxDelayMs);
}

function applyJitter(delayMs: number, jitter: JitterStrategy): number {
  if (delayMs === 0 || jitter === 'none') return delayMs;
  if (jitter === 'full') return Math.floor(Math.random() * (delayMs + 1));
  const halfDelay = delayMs / 2;
  return Math.floor(halfDelay + Math.random() * (delayMs - halfDelay + 1));
}

export type JitterStrategy = 'none' | 'full' | 'equal';

export interface RetryDelayOptions {
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly jitter?: JitterStrategy;
}

export class RetryWaitAbortError extends Error {
  constructor(message = 'Retry wait aborted') {
    super(message);
    this.name = 'RetryWaitAbortError';
  }
}

export function calculateRetryDelayMs(
  attempt: number,
  options?: RetryDelayOptions,
): number {
  assertPositiveInteger(attempt, 'attempt');
  const resolvedOptions = resolveRetryDelayOptions(options);
  const boundedDelay = calculateBoundedExponentialDelayMs(
    attempt,
    resolvedOptions.baseDelayMs,
    resolvedOptions.maxDelayMs,
  );
  return applyJitter(boundedDelay, resolvedOptions.jitter);
}

export function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  assertNonNegativeFiniteNumber(delayMs, 'delayMs');
  if (signal?.aborted) return Promise.reject(new RetryWaitAbortError());
  if (delayMs === 0) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;
    let abortListener: (() => void) | undefined;

    const cleanup = (): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      if (signal && abortListener) {
        signal.removeEventListener('abort', abortListener);
        abortListener = undefined;
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    if (signal) {
      abortListener = () => {
        cleanup();
        reject(new RetryWaitAbortError());
      };
      signal.addEventListener('abort', abortListener, { once: true });
    }
  });
}
