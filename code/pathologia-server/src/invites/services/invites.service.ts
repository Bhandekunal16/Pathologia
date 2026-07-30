import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuditService } from '../../audit/services/audit.service';
import {
  generateInviteToken,
  hashInviteToken,
} from '../../common/utils/invite-token.util';
import { hashValue } from '../../common/utils/hash.util';
import { getRequestHostname } from '../../common/utils/get-request-hostname.util';
import { EmailService } from '../../email/services/email.service';
import { AuthService } from '../../auth/services/auth.service';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { InviteStatus } from '../../shared/enums/invite-status.enum';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { UserRepository } from '../../users/repositories/user.repository';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
import { CreateInviteResponseDto } from '../dto/create-invite-response.dto';
import { ValidateInviteResponseDto } from '../dto/validate-invite-response.dto';
import { UserInviteRepository } from '../repositories/user-invite.repository';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class InvitesService {
  constructor(
    private readonly userInviteRepository: UserInviteRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly authService: AuthService,
  ) {}

  async createInvite(
    email: string,
    invitedByUserId: string,
    request?: Request,
  ): Promise<CreateInviteResponseDto> {
    const normalizedEmail = email.toLowerCase().trim();
    const inviter = await this.userRepository.findById(invitedByUserId);
    if (!inviter) {
      throw new NotFoundException('Inviting user not found');
    }

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const expiresAt = this.getExpiryDate();

    const pendingInvite =
      await this.userInviteRepository.findPendingByEmail(normalizedEmail);

    if (pendingInvite) {
      await this.userInviteRepository.updateById(pendingInvite._id.toString(), {
        tokenHash,
        expiresAt,
        status: InviteStatus.PENDING,
      });
    } else {
      await this.userInviteRepository.create({
        email: normalizedEmail,
        tokenHash,
        invitedBy: invitedByUserId,
        expiresAt,
      });
    }

    const inviteLink = this.buildInviteLink(token);
    void this.emailService.sendInviteEmail({
      email: normalizedEmail,
      inviterName: inviter.fullName,
      inviteLink,
      expiresAt,
    });

    await this.auditService.log({
      userId: invitedByUserId,
      action: AuditAction.USER_INVITE,
      entity: 'UserInvite',
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/invites',
          body: { email: normalizedEmail },
        },
        response: {
          success: true,
          data: { email: normalizedEmail, expiresAt },
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return {
      email: normalizedEmail,
      expiresAt,
      message: 'Invitation email sent successfully',
    };
  }

  async validateInvite(token: string): Promise<ValidateInviteResponseDto> {
    const invite = await this.findValidInvite(token);
    const inviter = await this.userRepository.findById(
      invite.invitedBy.toString(),
    );

    return {
      email: invite.email,
      expiresAt: invite.expiresAt,
      inviterName: inviter?.fullName,
    };
  }

  async acceptInvite(dto: AcceptInviteDto, request?: Request) {
    const invite = await this.findValidInvite(dto.token);

    const existingUser = await this.userRepository.findByEmail(invite.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await hashValue(dto.password);
    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: invite.email,
      username: dto.username,
      password: passwordHash,
      role: Role.USER,
      status: Status.ACTIVE,
    });

    await this.userInviteRepository.updateById(invite._id.toString(), {
      status: InviteStatus.ACCEPTED,
      acceptedAt: new Date(),
    });

    void this.emailService.sendWelcomeEmail({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    });

    await this.auditService.log({
      userId: user._id.toString(),
      action: AuditAction.USER_REGISTER,
      entity: 'User',
      entityId: user._id.toString(),
      metadata: {
        request: {
          method: request?.method ?? 'POST',
          path: request?.path ?? '/invites/accept',
          body: {
            email: invite.email,
            username: dto.username,
            invitedBy: invite.invitedBy.toString(),
          },
        },
        response: {
          success: true,
          entityId: user._id.toString(),
        },
      },
      hostname: getRequestHostname(request),
      userAgent: request?.headers['user-agent'],
    });

    return this.authService.issueAuthResponse(user, request);
  }

  private async findValidInvite(token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Invite token is required');
    }

    const invite = await this.userInviteRepository.findByTokenHash(
      hashInviteToken(token),
    );

    if (!invite || invite.status !== InviteStatus.PENDING) {
      throw new NotFoundException('Invite link is invalid or has already been used');
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await this.userInviteRepository.updateById(invite._id.toString(), {
        status: InviteStatus.EXPIRED,
      });
      throw new BadRequestException('Invite link has expired');
    }

    return invite;
  }

  private getExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
    return expiresAt;
  }

  private buildInviteLink(token: string): string {
    const frontendUrl =
      this.configService.get<string>('frontendUrl') ??
      this.configService.get<string[]>('corsOrigins')?.[0] ??
      'http://localhost:4200';

    return `${frontendUrl.replace(/\/$/, '')}/register?token=${encodeURIComponent(token)}`;
  }
}
