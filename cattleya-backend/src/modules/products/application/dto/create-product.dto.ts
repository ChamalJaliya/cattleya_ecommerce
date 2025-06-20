import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, IsUrl, Min, Max, Length, ArrayMinSize, ValidateNested, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrchidSize, ColorPattern, AttributeType } from '../../domain/entities/product.entity';

export class CreateProductImageDto {
  @ApiProperty({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Alt text for the image', example: 'Beautiful purple orchid' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Whether this is the main product image', default: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for image display', default: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ example: '#8B4CB8' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: OrchidSize })
  @IsOptional()
  @IsEnum(OrchidSize)
  size?: OrchidSize;
}

export class CreateProductAttributeDto {
  @ApiProperty({ example: 'Pot Size' })
  @IsString()
  name: string;

  @ApiProperty({ example: '4 inch' })
  @IsString()
  value: string;

  @ApiProperty({ enum: AttributeType, example: AttributeType.TEXT })
  @IsEnum(AttributeType)
  type: AttributeType;
}

export class CreateProductVariantDto {
  @ApiProperty({ description: 'Variant name', example: 'Large Purple' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Variant SKU', example: 'CATT-001-LG' })
  @IsString()
  @Length(1, 100)
  sku: string;

  @ApiProperty({ description: 'Variant price', example: 149.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Variant sale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Stock quantity', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Orchid size', enum: OrchidSize })
  @IsOptional()
  @IsEnum(OrchidSize)
  size?: OrchidSize;

  @ApiPropertyOptional({ description: 'Colors array (hex codes)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  colors: string[];

  @ApiPropertyOptional({ description: 'Whether this is the default variant' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Variant images', type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ 
    description: 'Variant attributes',
    type: [CreateProductAttributeDto] 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeDto)
  attributes?: CreateProductAttributeDto[];
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Cattleya Purple Majesty' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Product slug', example: 'cattleya-purple-majesty' })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiProperty({ description: 'Product description', example: 'Beautiful purple Cattleya orchid with stunning blooms' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Purple Cattleya orchid' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Base price', example: 149.99 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'CATT-001' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Stock quantity', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  trackQuantity?: boolean;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: '15x10x8 cm' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({ description: 'Default orchid size', enum: OrchidSize })
  @IsOptional()
  @IsEnum(OrchidSize)
  defaultSize?: OrchidSize;

  @ApiPropertyOptional({ description: 'Available sizes', enum: OrchidSize, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(OrchidSize, { each: true })
  availableSizes?: OrchidSize[];

  @ApiPropertyOptional({ description: 'Primary colors', example: ['#8B5CF6', '#9333EA'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryColors?: string[];

  @ApiPropertyOptional({ description: 'Color pattern', enum: ColorPattern })
  @IsOptional()
  @IsEnum(ColorPattern)
  colorPattern?: ColorPattern;

  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Product images', type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ description: 'Product variants', type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({ example: ['purple', 'fragrant', 'beginner-friendly'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Purple Cattleya Orchid - Premium Quality' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Beautiful purple Cattleya orchid perfect for collectors' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['cattleya', 'orchid', 'purple', 'blooming'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Whether product is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether product is featured', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiPropertyOptional({ example: '2024-04-01T12:00:00' })
  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Care instructions', example: 'Water weekly, bright indirect light' })
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Bloom season', example: 'Spring, Fall' })
  @IsOptional()
  @IsString()
  bloomSeason?: string;

  @ApiPropertyOptional({ description: 'Fragrance description', example: 'Sweet citrus scent' })
  @IsOptional()
  @IsString()
  fragrance?: string;
} 