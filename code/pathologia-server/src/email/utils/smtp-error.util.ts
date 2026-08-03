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

interface EmailErrorContext {
  readonly error: Error;
  readonly code: string | undefined;
  readonly responseCode: number | undefined;
}

interface EmailClassificationRule {
  readonly id: string;
  readonly kind: EmailDeliveryErrorKind;
  readonly retryable: boolean;
  readonly matches: (context: EmailErrorContext) => boolean;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('Unknown email error');
}

function getOptionalStringProperty(
  value: object,
  propertyName: string,
): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(value, propertyName))
    return undefined;
  const propertyValue: unknown = (value as Record<string, unknown>)[
    propertyName
  ];
  return typeof propertyValue === 'string' ? propertyValue : undefined;
}

function getOptionalNumberProperty(
  value: object,
  propertyName: string,
): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(value, propertyName))
    return undefined;
  const propertyValue: unknown = (value as Record<string, unknown>)[
    propertyName
  ];
  return typeof propertyValue === 'number' && Number.isFinite(propertyValue)
    ? propertyValue
    : undefined;
}

function createEmailErrorContext(error: unknown): EmailErrorContext {
  const normalizedError = toError(error);
  return {
    error: normalizedError,
    code: getOptionalStringProperty(normalizedError, 'code'),
    responseCode: getOptionalNumberProperty(normalizedError, 'responseCode'),
  };
}

function createClassifiedEmailError(
  kind: EmailDeliveryErrorKind,
  error: Error,
  retryable: boolean,
): ClassifiedEmailError {
  return { kind, error, retryable };
}

function hasErrorCode(
  context: EmailErrorContext,
  codes: ReadonlySet<string>,
): boolean {
  return context.code !== undefined && codes.has(context.code);
}

function hasSmtpResponseCode(
  context: EmailErrorContext,
  codes: ReadonlySet<number>,
): boolean {
  return context.responseCode !== undefined && codes.has(context.responseCode);
}

function hasSmtpResponseCodeAtLeast(
  context: EmailErrorContext,
  minimumCode: number,
): boolean {
  return (
    context.responseCode !== undefined && context.responseCode >= minimumCode
  );
}

const EMAIL_CLASSIFICATION_RULES: readonly EmailClassificationRule[] = [
  {
    id: 'smtp-configuration-code',
    kind: EmailDeliveryErrorKind.Configuration,
    retryable: false,
    matches: (context) => hasErrorCode(context, CONFIGURATION_ERROR_CODES),
  },
  {
    id: 'smtp-configuration-response',
    kind: EmailDeliveryErrorKind.Configuration,
    retryable: false,
    matches: (context) =>
      hasSmtpResponseCode(context, CONFIGURATION_SMTP_RESPONSE_CODES),
  },
  {
    id: 'network-transient-code',
    kind: EmailDeliveryErrorKind.Transient,
    retryable: true,
    matches: (context) => hasErrorCode(context, TRANSIENT_ERROR_CODES),
  },
  {
    id: 'smtp-transient-response',
    kind: EmailDeliveryErrorKind.Transient,
    retryable: true,
    matches: (context) =>
      hasSmtpResponseCode(context, TRANSIENT_SMTP_RESPONSE_CODES),
  },
  {
    id: 'smtp-generic-5xx',
    kind: EmailDeliveryErrorKind.Transient,
    retryable: true,
    matches: (context) => hasSmtpResponseCodeAtLeast(context, 500),
  },
  {
    id: 'smtp-generic-4xx',
    kind: EmailDeliveryErrorKind.Permanent,
    retryable: false,
    matches: (context) => hasSmtpResponseCodeAtLeast(context, 400),
  },
];

const UNKNOWN_CLASSIFICATION = {
  kind: EmailDeliveryErrorKind.Unknown,
  retryable: false,
} as const;

function classifyFromRules(context: EmailErrorContext): ClassifiedEmailError {
  for (const rule of EMAIL_CLASSIFICATION_RULES) {
    if (rule.matches(context))
      return createClassifiedEmailError(
        rule.kind,
        context.error,
        rule.retryable,
      );
  }

  return createClassifiedEmailError(
    UNKNOWN_CLASSIFICATION.kind,
    context.error,
    UNKNOWN_CLASSIFICATION.retryable,
  );
}

export function classifyEmailError(error: unknown): ClassifiedEmailError {
  const context = createEmailErrorContext(error);
  return classifyFromRules(context);
}
