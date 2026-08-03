import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import type { IUserRepository } from '../../users/repositories/user.repository.interface';
import { Status } from '../../shared/enums/status.enum';
import { Role } from '../../shared/enums/role.enum';
import { Types } from 'mongoose';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: jest.Mocked<Pick<IUserRepository, 'findById'>>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<Pick<IUserRepository, 'findById'>>;

    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(
      configService,
      userRepository as unknown as IUserRepository,
    );
  });

  it('should return payload for active user', async () => {
    const payload = {
      sub: new Types.ObjectId().toString(),
      email: 'admin@test.com',
      username: 'admin',
      role: Role.ADMIN,
    };

    userRepository.findById.mockResolvedValue({
      status: Status.ACTIVE,
    } as never);

    await expect(strategy.validate(payload)).resolves.toEqual(payload);
  });

  it('should throw for inactive or missing user', async () => {
    const payload = {
      sub: new Types.ObjectId().toString(),
      email: 'user@test.com',
      username: 'user',
      role: Role.PATHOLOGIST,
    };

    userRepository.findById.mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);

    userRepository.findById.mockResolvedValue({
      status: Status.INACTIVE,
    } as never);
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
