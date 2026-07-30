import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateTestBookingDto {
  @ApiProperty({ type: [String], example: ['665f1a2b3c4d5e6f7a8b9c0d'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  testIds: string[];

  @ApiProperty({ example: '2026-08-15T10:30:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 'Fasting required' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Required when pathologist books on behalf of a user' })
  @IsOptional()
  @IsEmail()
  patientEmail?: string;

  @ApiPropertyOptional({ description: 'OTP sent to patient email for on-behalf booking' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  otp?: string;
}
