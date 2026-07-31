import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { getRequestHostname } from '../../common/utils/get-request-hostname.util';
import { AuditService } from '../../audit/services/audit.service';
import { compareHash, hashValue } from '../../common/utils/hash.util';
import { AuthJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { Status } from '../../shared/enums/status.enum';
import { USER_REPOSITORY } from '../../users/repositories/user.repository.interface';
import type { IUserRepository } from '../../users/repositories/user.repository.interface';
import type { UserDocument } from '../../users/schemas/user.schema';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AUTH_ERRORS } from '../constants/auth-errors.constants';
import {
  AuthSourceUser,
  JwtExpiresIn,
  JwtUser,
  LoginAuditContext,
  LogoutAuditContext,
  TokenPair,
} from '../interfaces/auth-service.types';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: JwtExpiresIn;
  private readonly refreshExpiresIn: JwtExpiresIn;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>('jwt.secret');
    this.refreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    this.accessExpiresIn = (this.configService.get<string>('jwt.expiresIn') ??
      '15m') as JwtExpiresIn;
    this.refreshExpiresIn = (this.configService.get<string>(
      'jwt.refreshExpiresIn',
    ) ?? '7d') as JwtExpiresIn;
  }

  public async login(
    dto: LoginDto,
    request?: Request,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailOrUsername(
      dto.identifier,
    );

    if (!user) {
      this.rejectInvalidCredentials();
    }

    if (user.status !== Status.ACTIVE) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_INACTIVE);
    }

    if (!(await compareHash(dto.password, user.password))) {
      this.rejectInvalidCredentials();
    }

    return this.completeLogin(user, {
      request,
      defaultPath: '/auth/login',
    });
  }

  public async logout(userId: string, request?: Request): Promise<void> {
    await this.userRepository.setRefreshTokenHash(userId, null);

    this.auditLogout(userId, {
      request,
      defaultPath: '/auth/logout',
    });
  }

  public async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const { sub } = await this.jwtService
      .verifyAsync<AuthJwtPayload>(refreshToken, { secret: this.refreshSecret })
      .catch(() => {
        this.rejectInvalidRefreshToken();
      });

    const user = await this.userRepository.findByIdWithSecrets(sub);

    if (!user || user.status !== Status.ACTIVE) {
      this.rejectInvalidRefreshToken();
    }

    if (!user.refreshTokenHash) {
      this.rejectInvalidRefreshToken();
    }

    if (!(await compareHash(refreshToken, user.refreshTokenHash))) {
      this.rejectInvalidRefreshToken();
    }

    const tokens = await this.issueTokens(user);

    return { ...tokens, user: UserResponseDto.fromDocument(user) };
  }

  public async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    return UserResponseDto.fromDocument(user);
  }

  public async issueAuthResponse(
    sourceUser: AuthSourceUser,
    request?: Request,
  ): Promise<AuthResponseDto> {
    const userDocument = await this.userRepository.findById(
      sourceUser._id.toString(),
    );

    if (!userDocument || userDocument.status !== Status.ACTIVE) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_ACTIVE);
    }

    return this.completeLogin(userDocument, {
      request,
      defaultPath: '/invites/accept',
    });
  }

  private async completeLogin(
    user: UserDocument,
    auditContext: LoginAuditContext,
  ): Promise<AuthResponseDto> {
    const userId = user._id.toString();

    const [tokens] = await Promise.all([
      this.issueTokens(user),
      this.userRepository.updateLastLogin(userId),
    ]);

    this.auditLogin(userId, auditContext);

    return { ...tokens, user: UserResponseDto.fromDocument(user) };
  }

  private async issueTokens(user: JwtUser): Promise<TokenPair> {
    const tokens = await this.createTokenPair(user);
    await this.persistRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  private buildJwtPayload(user: JwtUser): AuthJwtPayload {
    return {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  private async createTokenPair(user: JwtUser): Promise<TokenPair> {
    const payload = this.buildJwtPayload(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.setRefreshTokenHash(
      userId,
      await hashValue(refreshToken),
    );
  }

  private auditLogin(userId: string, context: LoginAuditContext): void {
    this.auditService.log({
      userId,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: userId,
      metadata: {
        request: {
          method: this.getRequestMethod(context.request, 'POST'),
          path: this.getRequestPath(context.request, context.defaultPath),
        },
        response: {
          success: true,
          entityId: userId,
        },
      },
      hostname: getRequestHostname(context.request),
      userAgent: this.getUserAgent(context.request),
    });
  }

  private auditLogout(userId: string, context: LogoutAuditContext): void {
    this.auditService.log({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: userId,
      metadata: {
        request: {
          method: this.getRequestMethod(context.request, 'POST'),
          path: this.getRequestPath(context.request, context.defaultPath),
        },
        response: {
          success: true,
          entityId: userId,
        },
      },
      hostname: getRequestHostname(context.request),
      userAgent: this.getUserAgent(context.request),
    });
  }

  private getRequestMethod(
    request: Request | undefined,
    fallback: string,
  ): string {
    return request?.method ?? fallback;
  }

  private getRequestPath(
    request: Request | undefined,
    fallback: string,
  ): string {
    return request?.path ?? fallback;
  }

  private getUserAgent(request: Request | undefined): string | undefined {
    return request?.headers?.['user-agent'];
  }

  private rejectInvalidCredentials(): never {
    throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  private rejectInvalidRefreshToken(): never {
    throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }
}
