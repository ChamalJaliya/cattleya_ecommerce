import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439016',
    description: 'Product ID to add to wishlist'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
} 