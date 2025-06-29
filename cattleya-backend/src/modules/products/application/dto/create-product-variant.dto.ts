import { IsString, IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateProductVariantDto {
  @IsString() productId: string;
  @IsString() sku: string;
  @IsNumber() price: number;
  @IsNumber() stock: number;
  @IsObject() attributes: Record<string, string>;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() images?: string[]; // image IDs
} 