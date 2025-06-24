import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';

@Injectable()
export class RemoveFromCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string, itemId: string): Promise<void> {
    try {
      await this.cartRepository.removeItem(userId, itemId);
    } catch (error) {
      throw new NotFoundException('Cart item not found');
    }
  }
} 