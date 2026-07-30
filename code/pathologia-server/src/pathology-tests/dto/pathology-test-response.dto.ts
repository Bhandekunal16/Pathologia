import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { Status } from '../../shared/enums/status.enum';
import { PathologyTestDocument } from '../schemas/pathology-test.schema';

export class PathologyTestResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: PathologyTestDocument }) => obj._id.toString())
  id: string;

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
  specimenType: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  manual: string;

  @ApiProperty({ example: 0 })
  @Expose()
  rate: number;

  @ApiProperty({ enum: Status })
  @Expose()
  status: Status;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromDocument(test: PathologyTestDocument): PathologyTestResponseDto {
    const dto = new PathologyTestResponseDto();
    dto.id = test._id.toString();
    dto.name = test.name;
    dto.code = test.code;
    dto.category = test.category;
    dto.specimenType = test.specimenType;
    dto.description = test.description;
    dto.manual = test.manual;
    dto.rate = test.rate ?? 0;
    dto.status = test.status;
    dto.createdAt = test.createdAt;
    dto.updatedAt = test.updatedAt;
    return dto;
  }
}
