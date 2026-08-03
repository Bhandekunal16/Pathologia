import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import {
  BLOOD_TEST_STATUS_MAP,
  DEFAULT_BLOOD_TEST_STATUS,
} from '../constants/email.constants';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    const configService = {
      get: jest.fn((key: string) => {
        const map: Record<string, string | number> = {
          'smtp.host': '',
          'smtp.port': 587,
          'smtp.user': '',
          'smtp.pass': '',
          'smtp.from': '',
        };
        return map[key];
      }),
    } as unknown as ConfigService;

    emailService = new EmailService(configService);
  });

  it('should send welcome email without throwing when SMTP is not configured', async () => {
    await expect(
      emailService.sendWelcomeEmail({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        username: 'jane',
      }),
    ).resolves.toBeUndefined();
  });

  it('should send activation email without throwing when SMTP is not configured', async () => {
    await expect(
      emailService.sendActivationEmail({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      }),
    ).resolves.toBeUndefined();
  });

  it('should send temporary password email without throwing when SMTP is not configured', async () => {
    await expect(
      emailService.sendTemporaryPassword(
        { fullName: 'Jane Doe', email: 'jane@example.com' },
        'TmpPass1!',
      ),
    ).resolves.toBeUndefined();
  });

  it('should resolve known blood test statuses via statusProvider', () => {
    expect(emailService.statusProvider('PROCESSING_COMPLETED')).toEqual(
      BLOOD_TEST_STATUS_MAP.PROCESSING_COMPLETED,
    );
    expect(emailService.statusProvider('UNKNOWN')).toEqual(
      DEFAULT_BLOOD_TEST_STATUS,
    );
  });

  it('should use centralized subjects for welcome email path', async () => {
    const logSpy = jest.spyOn(emailService['logger'], 'log');

    await emailService.sendWelcomeEmail({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
    });

    expect(logSpy).toHaveBeenCalledWith(
      '[Email skipped] To: jane@example.com | Subject: Welcome to Pathologist Friend',
    );
  });
});
