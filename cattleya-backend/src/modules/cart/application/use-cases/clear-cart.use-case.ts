import { Injectable, Inject } from '@nestjs/common';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';

@Injectable()
export class ClearCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
} 