import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TestCategory } from '../../shared/enums/test-category.enum';
import { Status } from '../../shared/enums/status.enum';

export class UpdatePathologyTestDto {
  @ApiPropertyOptional({ example: 'Complete Blood Count (CBC)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'CBC-001' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ enum: TestCategory })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiPropertyOptional({ example: 'Venous Blood' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specimenType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  manual?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
