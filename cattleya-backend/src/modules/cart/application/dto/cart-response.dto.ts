import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ description: 'Cart item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Product image URL' })
  productImage: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Quantity in cart' })
  quantity: number;

  @ApiProperty({ description: 'Variant ID (optional)', required: false })
  variantId?: string;

  @ApiProperty({ description: 'Selected attributes (optional)', required: false })
  selectedAttributes?: any;

  @ApiProperty({ description: 'Cart item creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Cart item update date' })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ description: 'Cart ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Cart items', type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ description: 'Cart creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Cart update date' })
  updatedAt: Date;
} 