import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { UserDocument } from '../schemas/user.schema';

const ADMIN_DEPARTMENT = 'IT';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: UserDocument }) => obj._id.toString())
  id: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty({ enum: Role })
  @Expose()
  role: Role;

  @ApiProperty({ enum: Status })
  @Expose()
  status: Status;

  @ApiPropertyOptional()
  @Expose()
  lastLoginAt?: Date;

  @ApiPropertyOptional({ example: 'IT' })
  @Expose()
  department?: string;

  @ApiPropertyOptional({ example: 'General Surgical Pathology' })
  @Expose()
  specialization?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromDocument(user: UserDocument): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id.toString();
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.username = user.username;
    dto.role = user.role;
    dto.status = user.status;
    dto.lastLoginAt = user.lastLoginAt;
    dto.department =
      user.role === Role.ADMIN ? ADMIN_DEPARTMENT : user.department;
    dto.specialization =
      user.role === Role.PATHOLOGIST ? user.specialization : undefined;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
