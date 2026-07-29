import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../../email/services/email.service';
import { AuditService } from '../../audit/services/audit.service';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import * as hashUtil from '../../common/utils/hash.util';

jest.mock('../../common/utils/hash.util');

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let emailService: jest.Mocked<EmailService>;
  let auditService: jest.Mocked<AuditService>;

  const userId = new Types.ObjectId().toString();

  const mockUser = {
    _id: { toString: () => userId },
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    username: 'jane',
    password: 'hashed',
    role: Role.PATHOLOGIST,
    status: Status.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hashUtil.hashValue as jest.Mock).mockResolvedValue('hashed');
    (hashUtil.compareHash as jest.Mock).mockResolvedValue(true);
    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      updatePassword: jest.fn(),
      setRefreshTokenHash: jest.fn(),
      findByIdWithSecrets: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    emailService = {
      sendWelcomeEmail: jest.fn(),
      sendActivationEmail: jest.fn(),
      sendDeactivationEmail: jest.fn(),
      sendTemporaryPassword: jest.fn(),
      sendResetPassword: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    auditService = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    usersService = new UsersService(userRepository, emailService, auditService);
  });

  it('should create a user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser as never);

    const result = await usersService.create({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      username: 'jane',
      password: 'SecurePass1!',
      role: Role.PATHOLOGIST,
    });

    expect(result.email).toBe('jane@example.com');
    expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('should throw when creating user with duplicate email', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser as never);
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      usersService.create({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        username: 'jane2',
        password: 'SecurePass1!',
        role: Role.PATHOLOGIST,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should update profile', async () => {
    userRepository.findById.mockResolvedValue(mockUser as never);
    userRepository.update.mockResolvedValue({
      ...mockUser,
      fullName: 'Updated Name',
    } as never);

    const result = await usersService.updateProfile(userId, {
      fullName: 'Updated Name',
    });

    expect(result.fullName).toBe('Updated Name');
  });

  it('should reset password and send temporary password email', async () => {
    userRepository.findById.mockResolvedValue(mockUser as never);
    userRepository.updatePassword.mockResolvedValue();
    userRepository.setRefreshTokenHash.mockResolvedValue();

    await usersService.resetPassword(userId, { sendTemporaryPassword: true });

    expect(userRepository.updatePassword).toHaveBeenCalled();
    expect(emailService.sendTemporaryPassword).toHaveBeenCalled();
  });

  it('should reject password change with wrong current password', async () => {
    userRepository.findByIdWithSecrets.mockResolvedValue({
      ...mockUser,
      password: 'hashed',
    } as never);

    (hashUtil.compareHash as jest.Mock).mockResolvedValue(false);

    await expect(
      usersService.changePassword(userId, {
        currentPassword: 'WrongPass1!',
        newPassword: 'NewSecure1!',
        confirmPassword: 'NewSecure1!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(usersService.findById(userId)).rejects.toThrow(NotFoundException);
  });
});
