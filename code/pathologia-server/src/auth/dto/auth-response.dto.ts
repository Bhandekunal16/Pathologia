import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthTokensDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}

export class AuthResponseDto extends AuthTokensDto {
  @ApiProperty({ type: UserResponseDto })
  readonly user: UserResponseDto;
}
