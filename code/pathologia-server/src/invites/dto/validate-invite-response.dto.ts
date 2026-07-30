import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateInviteResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiPropertyOptional()
  inviterName?: string;
}
