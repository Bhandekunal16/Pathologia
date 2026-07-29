import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as ChangePasswordDto;
    return obj.newPassword === obj.confirmPassword;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Dr. Jane Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'jane.smith@hospital.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'jsmith' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: 'Anatomic Pathology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'General Surgical Pathology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass1!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsString()
  @IsNotEmpty()
  @Validate(PasswordMatchConstraint)
  confirmPassword: string;
}
