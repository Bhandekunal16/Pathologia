import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import type SMTPPool from 'nodemailer/lib/smtp-pool';

export interface EmailUserContext {
  fullName: string;
  email: string;
  username?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly templates = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private readonly configService: ConfigService) {
    this.loadTemplates();
    this.initTransporter();
  }

  private initTransporter(): void {
    if (this.transporter) return;

    const smtp = this.configService.get<{
      host: string;
      port: number;
      secure?: boolean;
      user: string;
      pass: string;
    }>('smtp');

    const { host, user, pass, port, secure } = smtp ?? {};

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be logged only.');
      return;
    }

    const smtpOptions: SMTPPool.Options = {
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

    void this.transporter
      .verify()
      .catch((err) => this.logger.error('SMTP verification failed', err));
  }

  private loadTemplates(): void {
    const candidateDirs = [
      path.join(__dirname, '..', 'templates'),
      path.join(__dirname, 'templates'),
      path.join(process.cwd(), 'dist', 'email', 'templates'),
      path.join(process.cwd(), 'src', 'email', 'templates'),
    ];
    const templateDir =
      candidateDirs.find((dir) => fs.existsSync(dir)) ?? candidateDirs[0];

    const templateFiles = [
      'welcome',
      'activation',
      'reset-password',
      'temporary-password',
      'deactivated',
      'invite',
      'booking-otp',
      'booking-confirmation',
      'blood-test-status',
      'blood-test-report-uploaded',
    ];

    for (const name of templateFiles) {
      const filePath = path.join(templateDir, `${name}.hbs`);
      if (fs.existsSync(filePath)) {
        const source = fs.readFileSync(filePath, 'utf-8');
        this.templates.set(name, handlebars.compile(source));
      } else {
        this.logger.warn(`Email template not found: ${filePath}`);
      }
    }
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const from = this.configService.get<string>('smtp.from');

    if (!this.transporter || !from) {
      this.logger.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private render(
    templateName: string,
    context: Record<string, string | undefined>,
  ): string {
    const template = this.templates.get(templateName);
    if (!template) {
      this.logger.error(`Email template "${templateName}" is not loaded`);
      return `<p>We were unable to render this email. Please contact support.</p>`;
    }
    return template(context);
  }

  async sendWelcomeEmail(user: EmailUserContext): Promise<void> {
    const html = this.render('welcome', {
      fullName: user.fullName,
      email: user.email,
      username: user.username ?? user.email,
    });
    await this.sendMail(user.email, 'Welcome to Pathologist Friend', html);
  }

  async sendActivationEmail(user: EmailUserContext): Promise<void> {
    const html = this.render('activation', { fullName: user.fullName });
    await this.sendMail(user.email, 'Your account has been activated', html);
  }

  async sendResetPassword(
    user: EmailUserContext,
    resetLink: string,
  ): Promise<void> {
    const html = this.render('reset-password', {
      fullName: user.fullName,
      resetLink,
    });
    await this.sendMail(user.email, 'Password Reset Request', html);
  }

  async sendTemporaryPassword(
    user: EmailUserContext,
    temporaryPassword: string,
  ): Promise<void> {
    const html = this.render('temporary-password', {
      fullName: user.fullName,
      temporaryPassword,
    });
    await this.sendMail(user.email, 'Your temporary password', html);
  }

  async sendDeactivationEmail(user: EmailUserContext): Promise<void> {
    const html = this.render('deactivated', { fullName: user.fullName });
    await this.sendMail(user.email, 'Your account has been deactivated', html);
  }

  async sendInviteEmail(params: {
    email: string;
    inviterName: string;
    inviteLink: string;
    expiresAt: Date;
  }): Promise<void> {
    const html = this.render('invite', {
      inviterName: params.inviterName,
      inviteLink: params.inviteLink,
      expiresAt: params.expiresAt.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });
    await this.sendMail(
      params.email,
      'You are invited to join Pathologia',
      html,
    );
  }

  async sendBookingOtpEmail(params: {
    email: string;
    patientName: string;
    pathologistName: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    const html = this.render('booking-otp', {
      patientName: params.patientName,
      pathologistName: params.pathologistName,
      otp: params.otp,
      expiresAt: params.expiresAt.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });
    await this.sendMail(
      params.email,
      'Pathologia booking verification OTP',
      html,
    );
  }

  async sendBookingConfirmationEmail(params: {
    email: string;
    patientName: string;
    bookedByName: string;
    scheduledAt: Date;
    tests: { name: string; code: string; rate: number }[];
    totalAmount: number;
  }): Promise<void> {
    const testsHtml = params.tests
      .map(
        (test) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${test.name} (${test.code})</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${test.rate}</td></tr>`,
      )
      .join('');

    const html = this.render('booking-confirmation', {
      patientName: params.patientName,
      bookedByName: params.bookedByName,
      scheduledAt: params.scheduledAt.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      testsHtml,
      totalAmount: `₹${params.totalAmount}`,
    });
    await this.sendMail(
      params.email,
      'Your Pathologia test booking is confirmed',
      html,
    );
  }

  async sendBloodTestStatusEmail(params: {
    email: string;
    patientName: string;
    testName: string;
    status: string;
  }): Promise<void> {
    const statusLabel =
      params.status === 'PROCESSING_COMPLETED'
        ? 'Processing Completed'
        : 'Report Delivered';

    const html = this.render('blood-test-status', {
      patientName: params.patientName,
      testName: params.testName,
      statusLabel,
      message:
        params.status === 'PROCESSING_COMPLETED'
          ? 'Your blood test sample processing has been completed. The report will be available soon.'
          : 'Your blood test report has been delivered. You can view and download it from your Pathologia portal.',
    });

    await this.sendMail(
      params.email,
      `Pathologia: ${statusLabel} - ${params.testName}`,
      html,
    );
  }

  async sendBloodTestReportUploadedEmail(params: {
    email: string;
    patientName: string;
    testName: string;
    fileName: string;
  }): Promise<void> {
    const html = this.render('blood-test-report-uploaded', {
      patientName: params.patientName,
      testName: params.testName,
      fileName: params.fileName,
    });

    await this.sendMail(
      params.email,
      `Pathologia: Report uploaded for ${params.testName}`,
      html,
    );
  }
}
