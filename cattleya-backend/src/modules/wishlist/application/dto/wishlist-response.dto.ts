import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../../products/application/dto/product-response.dto';

export class WishlistItemResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439015' })
  id: string;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  addedAt: string;
}

export class WishlistResponseDto {
  @ApiProperty({ example: 5 })
  totalItems: number;

  @ApiProperty({ example: 749.95 })
  totalValue: number;

  @ApiProperty({ type: [WishlistItemResponseDto] })
  items: WishlistItemResponseDto[];
} 