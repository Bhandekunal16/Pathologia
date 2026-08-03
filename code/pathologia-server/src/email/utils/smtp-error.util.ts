import {
  CONFIGURATION_ERROR_CODES,
  CONFIGURATION_SMTP_RESPONSE_CODES,
  TRANSIENT_ERROR_CODES,
  TRANSIENT_SMTP_RESPONSE_CODES,
} from '../constants/email.constants';
import {
  ClassifiedEmailError,
  EmailDeliveryErrorKind,
} from '../types/email.types';

interface NodemailerLikeError extends Error {
  readonly code?: string;
  readonly responseCode?: number;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown email error');
}

function getResponseCode(error: NodemailerLikeError): number | undefined {
  return typeof error.responseCode === 'number'
    ? error.responseCode
    : undefined;
}

/** Classifies SMTP/network failures for retry and logging decisions. */
export function classifyEmailError(error: unknown): ClassifiedEmailError {
  const normalizedError = toError(error);
  const nodemailerError = normalizedError as NodemailerLikeError;
  const responseCode = getResponseCode(nodemailerError);
  const code = nodemailerError.code;

  if (
    (code && CONFIGURATION_ERROR_CODES.has(code)) ||
    (responseCode !== undefined &&
      CONFIGURATION_SMTP_RESPONSE_CODES.has(responseCode))
  ) {
    return {
      kind: EmailDeliveryErrorKind.Configuration,
      error: normalizedError,
      retryable: false,
    };
  }

  if (
    (code && TRANSIENT_ERROR_CODES.has(code)) ||
    (responseCode !== undefined &&
      TRANSIENT_SMTP_RESPONSE_CODES.has(responseCode))
  ) {
    return {
      kind: EmailDeliveryErrorKind.Transient,
      error: normalizedError,
      retryable: true,
    };
  }

  if (responseCode !== undefined && responseCode >= 500) {
    return {
      kind: EmailDeliveryErrorKind.Transient,
      error: normalizedError,
      retryable: true,
    };
  }

  if (responseCode !== undefined && responseCode >= 400) {
    return {
      kind: EmailDeliveryErrorKind.Permanent,
      error: normalizedError,
      retryable: false,
    };
  }

  return {
    kind: EmailDeliveryErrorKind.Unknown,
    error: normalizedError,
    retryable: false,
  };
}
