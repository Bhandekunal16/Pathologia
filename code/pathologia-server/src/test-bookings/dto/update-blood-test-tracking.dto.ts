import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BloodTestTrackingStatus } from '../../shared/enums/blood-test-tracking-status.enum';

export class UpdateBloodTestTrackingDto {
  @ApiProperty({ enum: BloodTestTrackingStatus })
  @IsEnum(BloodTestTrackingStatus)
  status: BloodTestTrackingStatus;
}
