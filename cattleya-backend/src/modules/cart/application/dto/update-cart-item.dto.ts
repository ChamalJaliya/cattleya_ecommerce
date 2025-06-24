import { IsNumber, IsOptional, Min, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity for the cart item', minimum: 1 })
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