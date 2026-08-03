import type { BloodTestStatusContent } from '../types/email.types';

/** Centralized email subject lines. */
export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to Pathologist Friend',
  ACTIVATION: 'Your account has been activated',
  RESET_PASSWORD: 'Password Reset Request',
  TEMPORARY_PASSWORD: 'Your temporary password',
  DEACTIVATED: 'Your account has been deactivated',
  INVITE: 'You are invited to join Pathologia',
  BOOKING_OTP: 'Pathologia booking verification OTP',
  BOOKING_CONFIRMATION: 'Your Pathologia test booking is confirmed',
  bloodTestStatus: (statusLabel: string, testName: string): string =>
    `Pathologia: ${statusLabel} - ${testName}`,
  bloodTestReportUploaded: (testName: string): string =>
    `Pathologia: Report uploaded for ${testName}`,
} as const;

/** Known blood-test tracking statuses rendered in status emails. */
export const BLOOD_TEST_STATUS_MAP = {
  PROCESSING_COMPLETED: {
    label: 'Processing Completed',
    message:
      'Your blood test sample processing has been completed. The report will be available soon.',
  },
  REPORT_DELIVERED: {
    label: 'Report Delivered',
    message:
      'Your blood test report has been delivered. You can view and download it from your Pathologia portal.',
  },
} as const satisfies Record<string, BloodTestStatusContent>;

export const DEFAULT_BLOOD_TEST_STATUS: BloodTestStatusContent = {
  label: 'Unknown Status',
  message: 'Unknown Status',
};

/** SMTP response codes treated as transient (safe to retry). */
export const TRANSIENT_SMTP_RESPONSE_CODES = new Set([421, 451]);

/** Node/network error codes treated as transient (safe to retry). */
export const TRANSIENT_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'ENETUNREACH',
]);

/** SMTP/auth error codes that indicate configuration problems (no retry). */
export const CONFIGURATION_ERROR_CODES = new Set(['EAUTH', 'EMESSAGE']);

/** SMTP response codes that indicate authentication/configuration problems. */
export const CONFIGURATION_SMTP_RESPONSE_CODES = new Set([535, 534, 530]);

export const SMTP_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 4_000,
} as const;

export const TEMPLATE_FALLBACK_HTML =
  '<p>We were unable to render this email. Please contact support.</p>';
