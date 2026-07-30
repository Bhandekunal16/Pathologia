import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { EmailService } from '../../email/services/email.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { compareHash, hashValue } from '../../common/utils/hash.util';
import { CreateUserDto } from '../dto/create-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto, UpdateProfileDto } from '../dto/update-profile.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRepository } from '../repositories/user.repository';
import { UserListFilter } from '../repositories/user.repository.interface';

@Injectable()
export class UsersService {
  private static readonly ADMIN_DEPARTMENT = 'IT';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureUniqueEmailAndUsername(dto.email, dto.username);

    const passwordHash = await hashValue(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: passwordHash,
      status: dto.status ?? Status.ACTIVE,
      department: this.resolveDepartmentForRole(dto.role, dto.department),
      specialization:
        dto.role === Role.PATHOLOGIST ? dto.specialization : undefined,
    });

    void this.emailService.sendWelcomeEmail({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    });

    if (user.status === Status.ACTIVE) {
      void this.emailService.sendActivationEmail({
        fullName: user.fullName,
        email: user.email,
      });
    }

    return UserResponseDto.fromDocument(user);
  }

  async findAll(filter: UserListFilter) {
    const result = await this.userRepository.findAll(filter);
    return {
      ...result,
      items: result.items.map((user) => UserResponseDto.fromDocument(user)),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromDocument(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);
      if (emailTaken && emailTaken._id.toString() !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.username && dto.username !== existing.username) {
      const usernameTaken = await this.userRepository.findByUsername(
        dto.username,
      );
      if (usernameTaken && usernameTaken._id.toString() !== id) {
        throw new ConflictException('Username already exists');
      }
    }

    const updated = await this.userRepository.update(id, {
      ...dto,
      email: dto.email?.toLowerCase(),
    });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromDocument(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    auditContext?: {
      adminUserId?: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<UserResponseDto> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.updateStatus(id, dto.status);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    if (dto.status === Status.ACTIVE && existing.status !== Status.ACTIVE) {
      void this.emailService.sendActivationEmail({
        fullName: updated.fullName,
        email: updated.email,
      });
    }

    if (dto.status === Status.INACTIVE && existing.status !== Status.INACTIVE) {
      void this.emailService.sendDeactivationEmail({
        fullName: updated.fullName,
        email: updated.email,
      });
    }

    const action =
      dto.status === Status.ACTIVE
        ? AuditAction.USER_ACTIVATE
        : AuditAction.USER_DEACTIVATE;

    await this.auditService.log({
      userId: auditContext?.adminUserId,
      action,
      entity: 'User',
      entityId: id,
      metadata: {
        request: {
          method: 'PATCH',
          path: `/users/${id}/status`,
          body: { status: dto.status },
        },
        response: {
          success: true,
          entityId: id,
          data: { status: dto.status },
        },
      },
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
    });

    return UserResponseDto.fromDocument(updated);
  }

  async resetPassword(
    id: string,
    dto: ResetPasswordDto,
  ): Promise<{ temporaryPassword?: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sendTemporary = dto.sendTemporaryPassword !== false;
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await hashValue(temporaryPassword);

    await this.userRepository.updatePassword(id, passwordHash);
    await this.userRepository.setRefreshTokenHash(id, null);

    if (sendTemporary) {
      void this.emailService.sendTemporaryPassword(
        { fullName: user.fullName, email: user.email },
        temporaryPassword,
      );
      return {};
    }

    const resetLink = `https://pathologist-friend.local/reset-password?userId=${id}`;
    void this.emailService.sendResetPassword(
      { fullName: user.fullName, email: user.email },
      resetLink,
    );

    return { temporaryPassword };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.findById(userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);
      if (emailTaken && emailTaken._id.toString() !== userId) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.username && dto.username !== existing.username) {
      const usernameTaken = await this.userRepository.findByUsername(
        dto.username,
      );
      if (usernameTaken && usernameTaken._id.toString() !== userId) {
        throw new ConflictException('Username already exists');
      }
    }

    const updateData: UpdateUserDto & {
      department?: string;
      specialization?: string;
    } = {
      fullName: dto.fullName,
      email: dto.email?.toLowerCase(),
      username: dto.username,
    };

    if (existing.role === Role.ADMIN) {
      updateData.department = UsersService.ADMIN_DEPARTMENT;
    } else if (existing.role === Role.PATHOLOGIST) {
      if (dto.department !== undefined) {
        updateData.department = dto.department;
      }
      if (dto.specialization !== undefined) {
        updateData.specialization = dto.specialization;
      }
    }

    const updated = await this.userRepository.update(userId, updateData);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromDocument(updated);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findByIdWithSecrets(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await compareHash(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await hashValue(dto.newPassword);
    await this.userRepository.updatePassword(userId, passwordHash);
    await this.userRepository.setRefreshTokenHash(userId, null);
  }

  private resolveDepartmentForRole(role: Role, department?: string): string | undefined {
    if (role === Role.ADMIN) {
      return UsersService.ADMIN_DEPARTMENT;
    }
    if (role === Role.PATHOLOGIST) {
      return department;
    }
    return undefined;
  }

  private async ensureUniqueEmailAndUsername(
    email: string,
    username: string,
  ): Promise<void> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByUsername(username),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }
  }

  private generateTemporaryPassword(): string {
    const base = randomBytes(6).toString('base64url');
    return `Tmp${base}1!`;
  }
}
