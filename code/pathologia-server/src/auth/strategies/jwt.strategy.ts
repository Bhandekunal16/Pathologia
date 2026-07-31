import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ACCESS_STRATEGY } from '../../config/constants';
import { AuthJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { USER_REPOSITORY } from '../../users/repositories/user.repository.interface';
import type { IUserRepository } from '../../users/repositories/user.repository.interface';
import { Status } from '../../shared/enums/status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(
    configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) throw new Error('JWT_SECRET is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: AuthJwtPayload): Promise<AuthJwtPayload> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.status !== Status.ACTIVE)
      throw new UnauthorizedException('User is not active');
    return payload;
  }
}
