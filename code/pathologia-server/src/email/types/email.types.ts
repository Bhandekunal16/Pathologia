import type SMTPPool from 'nodemailer/lib/smtp-pool';

export interface EmailUserContext {
  readonly fullName: string;
  readonly email: string;
  readonly username?: string;
}

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly secure?: boolean;
  readonly user: string;
  readonly pass: string;
}

export interface BloodTestStatusContent {
  readonly label: string;
  readonly message: string;
}

export interface BookingTestItem {
  readonly name: string;
  readonly code: string;
  readonly rate: number;
}

export interface WelcomeTemplateContext {
  readonly fullName: string;
  readonly email: string;
  readonly username: string;
}

export interface ActivationTemplateContext {
  readonly fullName: string;
}

export interface ResetPasswordTemplateContext {
  readonly fullName: string;
  readonly resetLink: string;
}

export interface TemporaryPasswordTemplateContext {
  readonly fullName: string;
  readonly temporaryPassword: string;
}

export interface DeactivatedTemplateContext {
  readonly fullName: string;
}

export interface InviteTemplateContext {
  readonly inviterName: string;
  readonly inviteLink: string;
  readonly expiresAt: string;
}

export interface BookingOtpTemplateContext {
  readonly patientName: string;
  readonly pathologistName: string;
  readonly otp: string;
  readonly expiresAt: string;
}

export interface BookingConfirmationTemplateContext {
  readonly patientName: string;
  readonly bookedByName: string;
  readonly scheduledAt: string;
  readonly tests: ReadonlyArray<BookingTestItem>;
  readonly totalAmount: number;
}

export interface BloodTestStatusTemplateContext {
  readonly patientName: string;
  readonly testName: string;
  readonly statusLabel: string;
  readonly message: string;
}

export interface BloodTestReportUploadedTemplateContext {
  readonly patientName: string;
  readonly testName: string;
  readonly fileName: string;
}

export interface TemplateContextMap {
  readonly welcome: WelcomeTemplateContext;
  readonly activation: ActivationTemplateContext;
  readonly 'reset-password': ResetPasswordTemplateContext;
  readonly 'temporary-password': TemporaryPasswordTemplateContext;
  readonly deactivated: DeactivatedTemplateContext;
  readonly invite: InviteTemplateContext;
  readonly 'booking-otp': BookingOtpTemplateContext;
  readonly 'booking-confirmation': BookingConfirmationTemplateContext;
  readonly 'blood-test-status': BloodTestStatusTemplateContext;
  readonly 'blood-test-report-uploaded': BloodTestReportUploadedTemplateContext;
}

export type EmailTemplateName = keyof TemplateContextMap;

export interface SendTemplateEmailOptions<T extends EmailTemplateName> {
  readonly to: string;
  readonly subject: string;
  readonly template: T;
  readonly context: TemplateContextMap[T];
}

export interface DeliverMailOptions {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly template: EmailTemplateName;
}

export interface SmtpPoolTransportOptions extends SMTPPool.Options {}

export enum EmailDeliveryErrorKind {
  Configuration = 'configuration',
  Transient = 'transient',
  Permanent = 'permanent',
  Unknown = 'unknown',
}

export interface ClassifiedEmailError {
  readonly kind: EmailDeliveryErrorKind;
  readonly error: Error;
  readonly retryable: boolean;
}

export interface EmailSendResult {
  readonly success: boolean;
  readonly retryCount: number;
  readonly durationMs: number;
  readonly error?: ClassifiedEmailError;
}
