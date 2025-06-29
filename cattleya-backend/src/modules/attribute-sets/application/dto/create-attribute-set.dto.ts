import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  minValue?: number;

  @IsOptional()
  maxValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsBoolean()
  allowCustom?: boolean;
}

export class CreateAttributeSetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeDto)
  attributes?: CreateAttributeDto[];
} 