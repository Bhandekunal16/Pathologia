import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { getRequestHostname } from '../../common/utils/get-request-hostname.util';
import { AuditService } from '../../audit/services/audit.service';
import { compareHash, hashValue } from '../../common/utils/hash.util';
import { AuthJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { Status } from '../../shared/enums/status.enum';
import { UserRepository } from '../../users/repositories/user.repository';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  public async login(
    dto: LoginDto,
    request?: Request,
  ): Promise<AuthResponseDto> {
    const { identifier } = dto;
    const { method, path, headers } = request ?? {};
    const user = await this.userRepository.findByEmailOrUsername(identifier);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const { status, password, _id } = user;

    if (status !== Status.ACTIVE)
      throw new UnauthorizedException('Account is inactive');

    const isPasswordValid = await compareHash(dto.password, password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const userId = _id.toString();

    const [tokens] = await Promise.all([
      this.generateTokens(user),
      this.userRepository.updateLastLogin(userId),
    ]);

    this.auditService.log({
      userId,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: userId,
      metadata: {
        request: {
          method: method ?? 'POST',
          path: path ?? '/auth/login',
        },
        response: {
          success: true,
          entityId: userId,
        },
      },
      hostname: getRequestHostname(request),
      userAgent: headers?.['user-agent'],
    });

    return { ...tokens, user: UserResponseDto.fromDocument(user) };
  }

  async logout(userId: string, request?: Request): Promise<void> {
    await this.userRepository.setRefreshTokenHash(userId, null);

    this.auditService.log({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: userId,
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/auth/logout',
        },
        response: {
          success: true,
          entityId: userId,
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: AuthJwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<AuthJwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findByIdWithSecrets(payload.sub);
    if (!user || user.status !== Status.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValidRefresh = await compareHash(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isValidRefresh) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: UserResponseDto.fromDocument(user),
    };
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return UserResponseDto.fromDocument(user);
  }

  async issueAuthResponse(
    user: {
      _id: { toString(): string };
      email: string;
      username: string;
      role: string;
      fullName: string;
      status: Status;
    },
    request?: Request,
  ): Promise<AuthResponseDto> {
    const userDocument = await this.userRepository.findById(
      user._id.toString(),
    );
    if (!userDocument || userDocument.status !== Status.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    const tokens = await this.generateTokens(userDocument);
    await this.userRepository.updateLastLogin(userDocument._id.toString());

    this.auditService.log({
      userId: userDocument._id.toString(),
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: userDocument._id.toString(),
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/invites/accept',
        },
        response: {
          success: true,
          entityId: userDocument._id.toString(),
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return {
      ...tokens,
      user: UserResponseDto.fromDocument(userDocument),
    };
  }

  private async generateTokens(user: {
    _id: { toString(): string };
    email: string;
    username: string;
    role: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: AuthJwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessSecret = this.configService.get<string>('jwt.secret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpiresIn =
      this.configService.get<string>('jwt.expiresIn') ?? '15m';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    const refreshTokenHash = await hashValue(refreshToken);
    await this.userRepository.setRefreshTokenHash(
      user._id.toString(),
      refreshTokenHash,
    );

    return { accessToken, refreshToken };
  }
}
