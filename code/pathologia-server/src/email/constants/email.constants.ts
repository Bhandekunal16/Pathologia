import type { BloodTestStatusContent } from '../types/email.types';
import config from '../../config/json/email.config.json';

const {
  TRANSIENT_SMTP_RESPONSE_CODES: transientSmtpResponseCodes,
  CONFIGURATION_SMTP_RESPONSE_CODES: configurationSmtpResponseCodes,
  CONFIGURATION_ERROR_CODES: configurationErrorCodes,
  TRANSIENT_ERROR_CODES: transientErrorCodes,
  SMTP_RETRY_CONFIG: smtpRetryConfig,
} = config as {
  TRANSIENT_SMTP_RESPONSE_CODES: readonly number[];
  CONFIGURATION_SMTP_RESPONSE_CODES: readonly number[];
  CONFIGURATION_ERROR_CODES: readonly string[];
  TRANSIENT_ERROR_CODES: readonly string[];
  SMTP_RETRY_CONFIG: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
};

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

export const TRANSIENT_SMTP_RESPONSE_CODES = new Set(
  transientSmtpResponseCodes,
);
export const CONFIGURATION_SMTP_RESPONSE_CODES = new Set(
  configurationSmtpResponseCodes,
);
export const CONFIGURATION_ERROR_CODES = new Set(configurationErrorCodes);
export const TRANSIENT_ERROR_CODES = new Set(transientErrorCodes);

export const SMTP_RETRY_CONFIG = smtpRetryConfig;

export const TEMPLATE_FALLBACK_HTML =
  '<p>We were unable to render this email. Please contact support.</p>';
