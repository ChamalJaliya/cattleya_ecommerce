import { Injectable, Inject } from '@nestjs/common';
import { IWishlistRepository } from '../../domain/repositories/wishlist.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { WishlistResponseDto } from '../dto/wishlist-response.dto';
import { WishlistMapper } from '../mappers/wishlist.mapper';

@Injectable()
export class GetWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(userId: string): Promise<WishlistResponseDto> {
    const wishlistItems = await this.wishlistRepository.findByUserId(userId);
    
    if (wishlistItems.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        items: [],
      };
    }

    const productIds = wishlistItems.map(item => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    return WishlistMapper.toResponseDto(wishlistItems, products);
  }
} 