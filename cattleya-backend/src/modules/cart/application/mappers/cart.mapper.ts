import { CartEntity } from '../../domain/entities/cart.entity';
import { CartResponseDto } from '../dto/cart-response.dto';

export class CartMapper {
  static toResponseDto(entity: CartEntity): CartResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      items: entity.items,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
} 