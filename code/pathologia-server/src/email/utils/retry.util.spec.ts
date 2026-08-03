import {
  calculateRetryDelayMs,
  RetryWaitAbortError,
  wait,
} from './retry.util';

describe('retry.util', () => {
  describe('calculateRetryDelayMs', () => {
    it('uses deterministic exponential backoff with cap by default', () => {
      expect(calculateRetryDelayMs(1)).toBe(500);
      expect(calculateRetryDelayMs(2)).toBe(1000);
      expect(calculateRetryDelayMs(10)).toBe(4000);
    });

    it('throws for non-positive attempts', () => {
      expect(() => calculateRetryDelayMs(0)).toThrow(RangeError);
      expect(() => calculateRetryDelayMs(-1)).toThrow(RangeError);
      expect(() => calculateRetryDelayMs(1.5)).toThrow(RangeError);
    });

    it('throws for invalid delay configuration', () => {
      expect(() =>
        calculateRetryDelayMs(1, { baseDelayMs: -1, maxDelayMs: 100 }),
      ).toThrow(RangeError);
      expect(() =>
        calculateRetryDelayMs(1, { baseDelayMs: 100, maxDelayMs: 50 }),
      ).toThrow(RangeError);
      expect(() =>
        calculateRetryDelayMs(1, { jitter: 'invalid' as 'none' }),
      ).toThrow(RangeError);
    });

    it('caps very large attempt numbers safely', () => {
      expect(calculateRetryDelayMs(1_000)).toBe(4000);
    });

    it('supports custom delay configuration', () => {
      expect(
        calculateRetryDelayMs(2, { baseDelayMs: 200, maxDelayMs: 1_000 }),
      ).toBe(400);
    });

    it('applies full jitter within the bounded delay range', () => {
      const delays = Array.from({ length: 20 }, () =>
        calculateRetryDelayMs(3, { jitter: 'full' }),
      );

      for (const delay of delays) {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(2_000);
      }

      expect(new Set(delays).size).toBeGreaterThan(1);
    });

    it('applies equal jitter within the upper half of the bounded delay', () => {
      const delays = Array.from({ length: 20 }, () =>
        calculateRetryDelayMs(3, { jitter: 'equal' }),
      );

      for (const delay of delays) {
        expect(delay).toBeGreaterThanOrEqual(1_000);
        expect(delay).toBeLessThanOrEqual(2_000);
      }
    });
  });

  describe('wait', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('resolves after the requested delay', async () => {
      const pending = wait(250);
      jest.advanceTimersByTime(250);
      await expect(pending).resolves.toBeUndefined();
    });

    it('resolves immediately for zero delay', async () => {
      await expect(wait(0)).resolves.toBeUndefined();
    });

    it('throws for invalid delay values', () => {
      expect(() => wait(-1)).toThrow(RangeError);
      expect(() => wait(Number.NaN)).toThrow(RangeError);
    });

    it('rejects when aborted before the wait starts', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(wait(500, controller.signal)).rejects.toBeInstanceOf(
        RetryWaitAbortError,
      );
    });

    it('rejects and clears timers when aborted during the wait', async () => {
      const controller = new AbortController();
      const pending = wait(1_000, controller.signal);

      controller.abort();
      await expect(pending).rejects.toBeInstanceOf(RetryWaitAbortError);

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
