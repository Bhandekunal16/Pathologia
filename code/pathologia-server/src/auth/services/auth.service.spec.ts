import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { AuditService } from '../../audit/services/audit.service';
import { Status } from '../../shared/enums/status.enum';
import { Role } from '../../shared/enums/role.enum';
import { Types } from 'mongoose';
import * as hashUtil from '../../common/utils/hash.util';

jest.mock('../../common/utils/hash.util');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  const userId = new Types.ObjectId().toString();

  const mockUser = {
    _id: { toString: () => userId },
    fullName: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashed',
    role: Role.PATHOLOGIST,
    status: Status.ACTIVE,
    refreshTokenHash: '$2b$12$refresh',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hashUtil.compareHash as jest.Mock).mockResolvedValue(true);
    (hashUtil.hashValue as jest.Mock).mockResolvedValue('hashed');
    userRepository = {
      findByEmailOrUsername: jest.fn(),
      findById: jest.fn(),
      findByIdWithSecrets: jest.fn(),
      updateLastLogin: jest.fn(),
      setRefreshTokenHash: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    auditService = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const configService = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          'jwt.secret': 'access-secret',
          'jwt.expiresIn': '15m',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.refreshExpiresIn': '7d',
        };
        return map[key];
      }),
    } as unknown as ConfigService;

    authService = new AuthService(
      userRepository,
      jwtService,
      configService,
      auditService,
    );
  });

  it('should reject login for inactive users', async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue({
      ...mockUser,
      status: Status.INACTIVE,
    } as never);

    await expect(
      authService.login({ identifier: 'testuser', password: 'Pass1!' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should login active users and return tokens', async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(mockUser as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login({
      identifier: 'testuser',
      password: 'Pass1!',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(auditService.log).toHaveBeenCalled();
    expect(userRepository.updateLastLogin).toHaveBeenCalledWith(userId);
  });
});
