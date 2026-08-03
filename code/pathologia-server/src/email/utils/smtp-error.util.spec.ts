import {
  CONFIGURATION_SMTP_RESPONSE_CODES,
  TRANSIENT_SMTP_RESPONSE_CODES,
} from '../constants/email.constants';
import { EmailDeliveryErrorKind } from '../types/email.types';
import { classifyEmailError } from './smtp-error.util';

function createTransportError(
  message: string,
  properties: { code?: string; responseCode?: number } = {},
): Error {
  return Object.assign(new Error(message), properties);
}

describe('smtp-error.util', () => {
  describe('classifyEmailError', () => {
    it('classifies configuration error codes', () => {
      const classified = classifyEmailError(
        createTransportError('invalid credentials', { code: 'EAUTH' }),
      );

      expect(classified).toEqual({
        kind: EmailDeliveryErrorKind.Configuration,
        error: expect.any(Error),
        retryable: false,
      });
    });

    it('classifies configuration SMTP response codes', () => {
      for (const responseCode of CONFIGURATION_SMTP_RESPONSE_CODES) {
        const classified = classifyEmailError(
          createTransportError('auth failed', { responseCode }),
        );

        expect(classified.kind).toBe(EmailDeliveryErrorKind.Configuration);
        expect(classified.retryable).toBe(false);
      }
    });

    it('classifies transient network error codes', () => {
      const classified = classifyEmailError(
        createTransportError('connection reset', { code: 'ECONNRESET' }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });

    it('classifies transient SMTP response codes', () => {
      for (const responseCode of TRANSIENT_SMTP_RESPONSE_CODES) {
        const classified = classifyEmailError(
          createTransportError('try again', { responseCode }),
        );

        expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
        expect(classified.retryable).toBe(true);
      }
    });

    it('classifies generic SMTP 5xx responses as transient', () => {
      const classified = classifyEmailError(
        createTransportError('server error', { responseCode: 502 }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });

    it('classifies generic SMTP 4xx responses as permanent', () => {
      const classified = classifyEmailError(
        createTransportError('bad request', { responseCode: 404 }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Permanent);
      expect(classified.retryable).toBe(false);
    });

    it('classifies unknown errors', () => {
      const classified = classifyEmailError(
        createTransportError('unexpected failure'),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Unknown);
      expect(classified.retryable).toBe(false);
    });

    it('normalizes non-Error thrown values', () => {
      const fromString = classifyEmailError('smtp unavailable');
      const fromNumber = classifyEmailError(42);
      const fromObject = classifyEmailError({ reason: 'failed' });

      expect(fromString.error).toBeInstanceOf(Error);
      expect(fromString.error.message).toBe('smtp unavailable');
      expect(fromNumber.error.message).toBe('Unknown email error');
      expect(fromObject.error.message).toBe('Unknown email error');
      expect(fromString.kind).toBe(EmailDeliveryErrorKind.Unknown);
    });

    it('prefers configuration classification over generic 4xx', () => {
      const classified = classifyEmailError(
        createTransportError('auth failed', {
          code: 'EAUTH',
          responseCode: 535,
        }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Configuration);
      expect(classified.retryable).toBe(false);
    });

    it('prefers explicit transient SMTP codes over generic 4xx', () => {
      const classified = classifyEmailError(
        createTransportError('temporary failure', { responseCode: 421 }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });

    it('prefers generic 5xx over generic 4xx', () => {
      const classified = classifyEmailError(
        createTransportError('server busy', { responseCode: 503 }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });
  });
});
