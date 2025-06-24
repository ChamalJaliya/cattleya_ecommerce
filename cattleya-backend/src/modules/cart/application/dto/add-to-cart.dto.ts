import { IsString, IsNumber, IsOptional, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID to add to cart' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product variant ID (optional)', required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Selected product attributes (optional)', required: false })
  @IsOptional()
  @IsObject()
  selectedAttributes?: any;
} 