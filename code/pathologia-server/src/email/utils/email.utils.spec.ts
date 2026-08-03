import {
  BLOOD_TEST_STATUS_MAP,
  DEFAULT_BLOOD_TEST_STATUS,
} from '../constants/email.constants';
import { classifyEmailError } from './smtp-error.util';
import { EmailDeliveryErrorKind } from '../types/email.types';

describe('email utils', () => {
  describe('classifyEmailError', () => {
    it('classifies transient network errors', () => {
      const classified = classifyEmailError(
        Object.assign(new Error('reset'), { code: 'ECONNRESET' }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });

    it('classifies authentication errors as configuration failures', () => {
      const classified = classifyEmailError(
        Object.assign(new Error('auth failed'), {
          code: 'EAUTH',
          responseCode: 535,
        }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Configuration);
      expect(classified.retryable).toBe(false);
    });

    it('classifies transient SMTP response codes', () => {
      const classified = classifyEmailError(
        Object.assign(new Error('try again'), { responseCode: 421 }),
      );

      expect(classified.kind).toBe(EmailDeliveryErrorKind.Transient);
      expect(classified.retryable).toBe(true);
    });
  });

  describe('blood test status map', () => {
    it('returns known status content', () => {
      expect(BLOOD_TEST_STATUS_MAP.PROCESSING_COMPLETED.label).toBe(
        'Processing Completed',
      );
      expect(BLOOD_TEST_STATUS_MAP.REPORT_DELIVERED.message).toContain(
        'delivered',
      );
    });

    it('falls back for unknown statuses', () => {
      expect(DEFAULT_BLOOD_TEST_STATUS.label).toBe('Unknown Status');
    });
  });
});
