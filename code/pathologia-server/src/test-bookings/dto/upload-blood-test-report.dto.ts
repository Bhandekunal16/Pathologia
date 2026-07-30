import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export class UploadBloodTestReportDto {
  @ApiProperty({ example: 'CBC_Report_John_Doe.pdf' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsIn(ALLOWED_MIME_TYPES)
  mimeType: string;

  @ApiProperty({ description: 'Base64-encoded file content' })
  @IsString()
  data: string;
}
