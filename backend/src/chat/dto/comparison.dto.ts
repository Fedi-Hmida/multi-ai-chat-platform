import { IsString, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CompareModelsDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 models must be selected for comparison' })
  @IsString({ each: true })
  models: string[];
}

export class ComparisonResponseDto {
  model: string;
  text: string;
  responseTime?: number;
  error?: string;
}
