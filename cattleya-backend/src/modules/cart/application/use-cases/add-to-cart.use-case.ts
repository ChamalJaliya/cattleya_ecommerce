import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { CartResponseDto } from '../dto/cart-response.dto';

@Injectable()
export class AddToCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(userId: string, dto: AddToCartDto): Promise<CartResponseDto> {
    // Validate quantity
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Check if product exists
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new ConflictException('Product not found');
    }

    // Check if product is in stock
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Add to cart
    return this.cartRepository.addItem(userId, dto);
  }
} 