import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @ApiPropertyOptional({
    description: 'Send temporary password via email instead of reset link',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  sendTemporaryPassword?: boolean = true;
}
