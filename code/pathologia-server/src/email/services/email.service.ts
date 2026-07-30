import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

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
    const host = this.configService.get<string>('smtp.host');
    const port = this.configService.get<number>('smtp.port');
    const secure = this.configService.get<boolean>('smtp.secure') ?? false;
    const user = this.configService.get<string>('smtp.user');
    const pass = this.configService.get<string>('smtp.pass');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be logged only.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
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

  private render(templateName: string, context: Record<string, string>): string {
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
}
