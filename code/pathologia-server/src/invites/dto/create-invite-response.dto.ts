import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  message: string;
}
