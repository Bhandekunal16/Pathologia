import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendBookingOtpDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  patientEmail: string;
}
