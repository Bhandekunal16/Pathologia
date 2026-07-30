import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { Status } from '../../shared/enums/status.enum';

export class CreatePathologyTestDto {
  @ApiProperty({ example: 'Complete Blood Count (CBC)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'CBC-001' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ enum: TestCategory, example: TestCategory.BLOOD })
  @IsEnum(TestCategory)
  category: TestCategory;

  @ApiProperty({ example: 'Venous Blood' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specimenType: string;

  @ApiPropertyOptional({ example: 'Measures red cells, white cells, and platelets.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example:
      'Patient should fast for 8-12 hours. Collect 3-5 mL venous blood in EDTA tube. Mix gently by inverting 8-10 times.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  manual: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
