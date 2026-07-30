import { ApiProperty } from '@nestjs/swagger';

export class SendBookingOtpResponseDto {
  @ApiProperty()
  patientEmail: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  message: string;
}
