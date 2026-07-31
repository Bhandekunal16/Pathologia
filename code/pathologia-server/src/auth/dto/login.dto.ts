import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username or email address',
  })
  @IsString()
  @IsNotEmpty()
  readonly identifier: string;

  @ApiProperty({ example: 'AdminPass1!' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
