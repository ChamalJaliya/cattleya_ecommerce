import { Injectable, Inject } from '@nestjs/common';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';
import { CartResponseDto } from '../dto/cart-response.dto';

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<CartResponseDto> {
    return this.cartRepository.findByUserId(userId);
  }
} 