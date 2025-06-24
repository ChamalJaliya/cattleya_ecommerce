import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IWishlistRepository } from '../../domain/repositories/wishlist.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { AddToWishlistDto } from '../dto/add-to-wishlist.dto';
import { Wishlist } from '../../domain/entities/wishlist.entity';

@Injectable()
export class AddToWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(userId: string, dto: AddToWishlistDto): Promise<void> {
    // Check if product exists
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new ConflictException('Product not found');
    }

    // Check if already in wishlist
    const existingItem = await this.wishlistRepository.findByUserIdAndProductId(
      userId,
      dto.productId
    );
    
    if (existingItem) {
      throw new ConflictException('Product already in wishlist');
    }

    // Add to wishlist
    const wishlistData = Wishlist.create({
      userId,
      productId: dto.productId,
    });

    await this.wishlistRepository.create(wishlistData);
  }
} 