import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

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
  @IsBoolean()
  isComparable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isVariantDefining?: boolean;

  @IsOptional()
  @IsBoolean()
  isVariantOverridable?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  options?: Array<{ value: string; label: string; isDefault: boolean }>;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsBoolean()
  allowCustom?: boolean;
} 