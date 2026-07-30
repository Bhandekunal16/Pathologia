import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { BloodTestTrackingStatus } from '../../shared/enums/blood-test-tracking-status.enum';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { BookedTestItem } from '../schemas/booked-test-item.schema';

export class BookedTestItemResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: BookedTestItem }) => obj._id?.toString())
  id: string;

  @ApiProperty()
  @Expose()
  testId: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty({ enum: TestCategory })
  @Expose()
  category: TestCategory;

  @ApiProperty()
  @Expose()
  rate: number;

  @ApiPropertyOptional({ enum: BloodTestTrackingStatus })
  @Expose()
  trackingStatus?: BloodTestTrackingStatus;

  @ApiPropertyOptional()
  @Expose()
  bloodCollectedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  processingAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  processingCompletedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  reportDeliveredAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  statusUpdatedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  reportFileName?: string;

  @ApiPropertyOptional()
  @Expose()
  reportMimeType?: string;

  @ApiPropertyOptional()
  @Expose()
  reportUploadedAt?: Date;

  @ApiProperty()
  @Expose()
  hasReport: boolean;

  static fromItem(item: BookedTestItem): BookedTestItemResponseDto {
    const dto = new BookedTestItemResponseDto();
    dto.id = item._id?.toString() ?? '';
    dto.testId = item.testId;
    dto.name = item.name;
    dto.code = item.code;
    dto.category = item.category ?? TestCategory.OTHER;
    dto.rate = item.rate;
    dto.trackingStatus = item.trackingStatus;
    dto.bloodCollectedAt = item.bloodCollectedAt;
    dto.processingAt = item.processingAt;
    dto.processingCompletedAt = item.processingCompletedAt;
    dto.reportDeliveredAt = item.reportDeliveredAt;
    dto.statusUpdatedAt = item.statusUpdatedAt;
    dto.reportFileName = item.reportFileName;
    dto.reportMimeType = item.reportMimeType;
    dto.reportUploadedAt = item.reportUploadedAt;
    dto.hasReport = !!item.reportData;
    return dto;
  }
}
