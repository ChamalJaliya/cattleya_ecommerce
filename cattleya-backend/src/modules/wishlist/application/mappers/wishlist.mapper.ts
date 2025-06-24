import { Wishlist } from '../../domain/entities/wishlist.entity';
import { WishlistItemResponseDto, WishlistResponseDto } from '../dto/wishlist-response.dto';
import { ProductResponseDto } from '../../../products/application/dto/product-response.dto';
import { ProductMapper } from '../../../products/application/mappers/product.mapper';

export class WishlistMapper {
  static toResponseDto(
    wishlistItems: Wishlist[], 
    products: any[]
  ): WishlistResponseDto {
    const productMapper = new ProductMapper();
    const items = wishlistItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.id,
        product: product ? productMapper.toProductResponseDto(product) : undefined,
        addedAt: item.createdAt.toISOString(),
      } as WishlistItemResponseDto;
    });

    const totalValue = items.reduce((sum, item) => sum + (item.product?.displayPrice || 0), 0);

    return {
      totalItems: items.length,
      totalValue,
      items,
    };
  }
} 