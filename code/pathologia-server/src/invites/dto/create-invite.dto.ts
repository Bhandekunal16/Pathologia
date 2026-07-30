import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'patient.user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
