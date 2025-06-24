import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWishlistRepository } from '../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class RemoveFromWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(userId: string, productId: string): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findByUserIdAndProductId(
      userId,
      productId
    );

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    await this.wishlistRepository.delete(wishlistItem.id);
  }
} 