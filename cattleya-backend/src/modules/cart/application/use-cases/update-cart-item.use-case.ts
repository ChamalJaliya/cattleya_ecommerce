import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartResponseDto } from '../dto/cart-response.dto';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    // Validate quantity
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    try {
      return await this.cartRepository.updateItem(userId, itemId, dto);
    } catch (error) {
      throw new NotFoundException('Cart item not found');
    }
  }
} 