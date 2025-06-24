import { Injectable, Inject } from '@nestjs/common';
import { IWishlistRepository } from '../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class ClearWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const wishlistItems = await this.wishlistRepository.findByUserId(userId);
    
    // Delete all items in parallel
    await Promise.all(
      wishlistItems.map(item => this.wishlistRepository.delete(item.id))
    );
  }
} 