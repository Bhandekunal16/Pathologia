import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as path from 'path';
import config from '../../config/json/email.config.json';
import {
  BLOOD_TEST_STATUS_MAP,
  DEFAULT_BLOOD_TEST_STATUS,
  EMAIL_SUBJECTS,
  SMTP_RETRY_CONFIG,
  TEMPLATE_FALLBACK_HTML,
} from '../constants/email.constants';
import {
  BloodTestStatusContent,
  DeliverMailOptions,
  EmailDeliveryErrorKind,
  EmailTemplateName,
  EmailUserContext,
  SendTemplateEmailOptions,
  SmtpConfig,
  SmtpPoolTransportOptions,
  TemplateContextMap,
} from '../types/email.types';
import { calculateRetryDelayMs, wait } from '../utils/retry.util';
import { classifyEmailError } from '../utils/smtp-error.util';
import {
  listTemplateFiles,
  readTemplateSource,
  resolveTemplateDirectory,
  toTemplateFilePath,
} from '../utils/template-directory.util';

export type { EmailUserContext } from '../types/email.types';

const {
  DIRECTORY,
  TEMPLATE_FILES,
  TEMPLATE_NAME,
  E,
  TEMPLATE_TYPES,
}: {
  TEMPLATE_FILES: string[];
  TEMPLATE_NAME: string;
  E: string;
  DIRECTORY: { skip: string; source: string; build: string };
  TEMPLATE_TYPES: {
    WELCOME: string;
    ACTIVATION: string;
    RESET_PASSWORD: string;
    TEMPORARY_PASSWORD: string;
    DEACTIVATED: string;
    INVITE: string;
    BOOKING_OTP: string;
    BOOKING_CONFIRMATION: string;
    BLOOD_TEST_STATUS: string;
    BLOOD_TEST_REPORT_UPLOADED: string;
  };
} = config;

const DATE_CONFIG = config.DATE_CONFIG as Intl.DateTimeFormatOptions;
const LOCALE = config.LOCALE as string;

const { skip, source, build }: { skip: string; source: string; build: string } =
  DIRECTORY;

const TEMPLATE_DIRECTORIES = [
  path.join(__dirname, skip, TEMPLATE_NAME),
  path.join(__dirname, TEMPLATE_NAME),
  path.join(process.cwd(), build, E, TEMPLATE_NAME),
  path.join(process.cwd(), source, E, TEMPLATE_NAME),
] as const;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly templates: ReadonlyMap<
    EmailTemplateName,
    HandlebarsTemplateDelegate
  >;
  private readonly from: string;
  private transporterRecoveryPromise: Promise<void> = Promise.resolve();
  private isRecoveringTransporter = false;

  constructor(private readonly configService: ConfigService) {
    this.templates = this.loadTemplates();
    this.initTransporter();
    this.from = this.configService.get<string>('smtp.from') ?? '';
  }

  public statusProvider(status: string): BloodTestStatusContent {
    return (
      BLOOD_TEST_STATUS_MAP[status as keyof typeof BLOOD_TEST_STATUS_MAP] ??
      DEFAULT_BLOOD_TEST_STATUS
    );
  }

  public async sendWelcomeEmail(user: EmailUserContext): Promise<void> {
    const { fullName, email, username } = user;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.WELCOME,
      template: TEMPLATE_TYPES.WELCOME as EmailTemplateName,
      context: {
        fullName,
        email,
        username: username ?? email,
      },
    });
  }

  public async sendActivationEmail(user: EmailUserContext): Promise<void> {
    const { fullName, email } = user;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.ACTIVATION,
      template: TEMPLATE_TYPES.ACTIVATION as EmailTemplateName,
      context: { fullName },
    });
  }

  public async sendResetPassword(
    user: EmailUserContext,
    resetLink: string,
  ): Promise<void> {
    const { fullName, email } = user;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.RESET_PASSWORD,
      template: TEMPLATE_TYPES.RESET_PASSWORD as EmailTemplateName,
      context: { fullName, resetLink },
    });
  }

  public async sendTemporaryPassword(
    user: EmailUserContext,
    temporaryPassword: string,
  ): Promise<void> {
    const { fullName, email } = user;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.TEMPORARY_PASSWORD,
      template: TEMPLATE_TYPES.TEMPORARY_PASSWORD as EmailTemplateName,
      context: { fullName, temporaryPassword },
    });
  }

  public async sendDeactivationEmail(user: EmailUserContext): Promise<void> {
    const { fullName, email } = user;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.DEACTIVATED,
      template: TEMPLATE_TYPES.DEACTIVATED as EmailTemplateName,
      context: { fullName },
    });
  }

  public async sendInviteEmail(params: {
    email: string;
    inviterName: string;
    inviteLink: string;
    expiresAt: Date;
  }): Promise<void> {
    const { email, inviterName, inviteLink, expiresAt } = params;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.INVITE,
      template: TEMPLATE_TYPES.INVITE as EmailTemplateName,
      context: {
        inviterName,
        inviteLink,
        expiresAt: this.formatDate(expiresAt),
      },
    });
  }

  public async sendBookingOtpEmail(params: {
    email: string;
    patientName: string;
    pathologistName: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    const { email, patientName, pathologistName, otp, expiresAt } = params;
    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.BOOKING_OTP,
      template: TEMPLATE_TYPES.BOOKING_OTP as EmailTemplateName,
      context: {
        patientName,
        pathologistName,
        otp,
        expiresAt: this.formatDate(expiresAt),
      },
    });
  }

  public async sendBookingConfirmationEmail(params: {
    email: string;
    patientName: string;
    bookedByName: string;
    scheduledAt: Date;
    tests: { name: string; code: string; rate: number }[];
    totalAmount: number;
  }): Promise<void> {
    const {
      email,
      patientName,
      bookedByName,
      scheduledAt,
      tests,
      totalAmount,
    } = params;

    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.BOOKING_CONFIRMATION,
      template: TEMPLATE_TYPES.BOOKING_CONFIRMATION as EmailTemplateName,
      context: {
        patientName,
        bookedByName,
        scheduledAt: this.formatDate(scheduledAt),
        tests,
        totalAmount,
      },
    });
  }

  public async sendBloodTestStatusEmail(params: {
    email: string;
    patientName: string;
    testName: string;
    status: string;
  }): Promise<void> {
    const { email, patientName, testName, status } = params;
    const statusContent = this.statusProvider(status);

    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.bloodTestStatus(statusContent.label, testName),
      template: TEMPLATE_TYPES.BLOOD_TEST_STATUS as EmailTemplateName,
      context: {
        patientName,
        testName,
        statusLabel: statusContent.label,
        message: statusContent.message,
      },
    });
  }

  public async sendBloodTestReportUploadedEmail(params: {
    email: string;
    patientName: string;
    testName: string;
    fileName: string;
  }): Promise<void> {
    const { email, patientName, testName, fileName } = params;

    await this.sendTemplateEmail({
      to: email,
      subject: EMAIL_SUBJECTS.bloodTestReportUploaded(testName),
      template: TEMPLATE_TYPES.BLOOD_TEST_REPORT_UPLOADED as EmailTemplateName,
      context: {
        patientName,
        testName,
        fileName,
      },
    });
  }

  private async sendTemplateEmail<T extends EmailTemplateName>(
    options: SendTemplateEmailOptions<T>,
  ): Promise<void> {
    const html = this.render(options.template, options.context);
    await this.deliverMail({
      to: options.to,
      subject: options.subject,
      html,
      template: options.template,
    });
  }

  private render<T extends EmailTemplateName>(
    templateName: T,
    context: TemplateContextMap[T],
  ): string {
    const template = this.templates.get(templateName);
    if (!template) {
      this.logger.error(`Email template "${templateName}" is not loaded`);
      return TEMPLATE_FALLBACK_HTML;
    }

    return template(context);
  }

  private async deliverMail(options: DeliverMailOptions): Promise<void> {
    if (!this.transporter || !this.from) {
      this.logSkippedEmail(options.to, options.subject);
      return;
    }

    const startedAt = Date.now();
    let retryCount = 0;
    let lastClassifiedError: ReturnType<typeof classifyEmailError> | undefined;

    while (retryCount <= SMTP_RETRY_CONFIG.maxRetries) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        this.logDeliveredEmail({
          recipient: options.to,
          subject: options.subject,
          template: options.template,
          durationMs: Date.now() - startedAt,
          retryCount,
        });
        return;
      } catch (error) {
        const classified = classifyEmailError(error);
        lastClassifiedError = classified;

        if (!classified.retryable) {
          this.logDeliveryFailure({
            recipient: options.to,
            subject: options.subject,
            template: options.template,
            durationMs: Date.now() - startedAt,
            retryCount,
            classified,
          });
          return;
        }

        if (retryCount >= SMTP_RETRY_CONFIG.maxRetries) break;

        retryCount += 1;
        const delayMs = calculateRetryDelayMs(retryCount);
        this.logger.warn(
          `Transient SMTP failure | recipient=${options.to} | template=${options.template} | attempt=${retryCount}/${SMTP_RETRY_CONFIG.maxRetries} | delayMs=${delayMs} | error=${classified.error.message}`,
        );
        await wait(delayMs);
      }
    }

    await this.recoverTransporter();

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        this.logDeliveredEmail({
          recipient: options.to,
          subject: options.subject,
          template: options.template,
          durationMs: Date.now() - startedAt,
          retryCount,
          recovered: true,
        });
        return;
      } catch (recoveryError) {
        lastClassifiedError = classifyEmailError(recoveryError);
      }
    }

    if (
      lastClassifiedError?.kind === EmailDeliveryErrorKind.Unknown &&
      lastClassifiedError.error
    ) {
      this.logDeliveryFailure({
        recipient: options.to,
        subject: options.subject,
        template: options.template,
        durationMs: Date.now() - startedAt,
        retryCount,
        classified: lastClassifiedError,
      });
      throw lastClassifiedError.error;
    }

    this.logDeliveryFailure({
      recipient: options.to,
      subject: options.subject,
      template: options.template,
      durationMs: Date.now() - startedAt,
      retryCount,
      classified:
        lastClassifiedError ??
        classifyEmailError(new Error('Email delivery failed')),
    });
  }

  private initTransporter(): void {
    if (this.transporter) {
      return;
    }

    const smtp = this.configService.get<SmtpConfig>('smtp');
    const { host, user, pass, port, secure } = smtp ?? {};

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be logged only.');
      return;
    }

    const smtpOptions: SmtpPoolTransportOptions = {
      host,
      port: port ?? 587,
      secure: secure ?? false,
      pool: true,
      maxConnections: 5,
      maxMessages: Infinity,
      auth: {
        user,
        pass,
      },
    };

    this.transporter = nodemailer.createTransport(smtpOptions);

    void this.transporter.verify().catch((error) => {
      const classified = classifyEmailError(error);
      this.logger.error(
        `SMTP verification failed | kind=${classified.kind} | error=${classified.error.message}`,
        classified.error.stack,
      );
    });
  }

  private async recoverTransporter(): Promise<void> {
    if (this.isRecoveringTransporter) {
      return this.transporterRecoveryPromise;
    }

    this.isRecoveringTransporter = true;
    this.transporterRecoveryPromise = this.transporterRecoveryPromise
      .then(() => {
        if (this.transporter) {
          this.transporter.close?.();
          this.transporter = null;
        }

        this.initTransporter();
        this.logger.warn('SMTP transporter recreated after transient failures');
      })
      .finally(() => {
        this.isRecoveringTransporter = false;
      });

    return this.transporterRecoveryPromise;
  }

  private loadTemplates(): ReadonlyMap<
    EmailTemplateName,
    HandlebarsTemplateDelegate
  > {
    const templates = new Map<EmailTemplateName, HandlebarsTemplateDelegate>();
    const resolution = resolveTemplateDirectory(TEMPLATE_DIRECTORIES);

    if (!resolution) {
      this.logger.error('No email template directories configured');
      return templates;
    }

    const { directory, source: directorySource } = resolution;
    const availableFiles = listTemplateFiles(directory);

    if (!availableFiles) {
      this.logger.error(`Unable to read template directory: ${directory}`);
      return templates;
    }

    let loadedCount = 0;

    for (const name of TEMPLATE_FILES) {
      const templateName = name as EmailTemplateName;
      const fileName = `${name}.hbs`;

      if (!availableFiles.has(fileName)) {
        this.logger.warn(
          `Email template not found: ${toTemplateFilePath(directory, name)}`,
        );
        continue;
      }

      const filePath = toTemplateFilePath(directory, name);
      const sourceCode = readTemplateSource(filePath);

      if (!sourceCode) {
        this.logger.error(`Failed to load email template: ${filePath}`);
        continue;
      }

      templates.set(templateName, handlebars.compile(sourceCode));
      loadedCount += 1;
    }

    this.logger.log(
      `Email templates loaded | directory=${directory} | source=${directorySource} | loaded=${loadedCount}/${TEMPLATE_FILES.length}`,
    );

    return templates;
  }

  private formatDate(date: Date): string {
    return date.toLocaleString(LOCALE, DATE_CONFIG);
  }

  private logSkippedEmail(recipient: string, subject: string): void {
    this.logger.log(`[Email skipped] To: ${recipient} | Subject: ${subject}`);
  }

  private logDeliveredEmail(params: {
    readonly recipient: string;
    readonly subject: string;
    readonly template: EmailTemplateName;
    readonly durationMs: number;
    readonly retryCount: number;
    readonly recovered?: boolean;
  }): void {
    const recoverySuffix = params.recovered ? ' | recovered=true' : '';
    this.logger.log(
      `Email sent | recipient=${params.recipient} | template=${params.template} | durationMs=${params.durationMs} | retries=${params.retryCount}${recoverySuffix}`,
    );
  }

  private logDeliveryFailure(params: {
    readonly recipient: string;
    readonly subject: string;
    readonly template: EmailTemplateName;
    readonly durationMs: number;
    readonly retryCount: number;
    readonly classified: ReturnType<typeof classifyEmailError>;
  }): void {
    this.logger.error(
      `Email delivery failed | recipient=${params.recipient} | template=${params.template} | durationMs=${params.durationMs} | retries=${params.retryCount} | kind=${params.classified.kind} | error=${params.classified.error.message}`,
      params.classified.error.stack,
    );
  }
}
