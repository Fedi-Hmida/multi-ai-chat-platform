import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export enum ExportFormat {
  PDF = 'pdf',
  MARKDOWN = 'markdown',
  JSON = 'json',
  TEXT = 'text',
}

export class ExportRequestDto {
  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsOptional()
  chatId?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}

export class BatchExportRequestDto {
  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
