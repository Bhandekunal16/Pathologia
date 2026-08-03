import {
  BLOOD_TEST_STATUS_MAP,
  DEFAULT_BLOOD_TEST_STATUS,
} from '../constants/email.constants';

describe('email utils', () => {
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
