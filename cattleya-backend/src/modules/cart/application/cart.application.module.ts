import { Module } from '@nestjs/common';
import { AddToCartUseCase } from './use-cases/add-to-cart.use-case';
import { GetCartUseCase } from './use-cases/get-cart.use-case';
import { UpdateCartItemUseCase } from './use-cases/update-cart-item.use-case';
import { RemoveFromCartUseCase } from './use-cases/remove-from-cart.use-case';
import { ClearCartUseCase } from './use-cases/clear-cart.use-case';
import { CartMapper } from './mappers/cart.mapper';
import { ProductsModule } from '../../products/products.module';
import { CartDomainModule } from '../domain/cart.domain.module';

@Module({
  imports: [ProductsModule, CartDomainModule],
  providers: [
    AddToCartUseCase,
    GetCartUseCase,
    UpdateCartItemUseCase,
    RemoveFromCartUseCase,
    ClearCartUseCase,
    CartMapper,
  ],
  exports: [
    AddToCartUseCase,
    GetCartUseCase,
    UpdateCartItemUseCase,
    RemoveFromCartUseCase,
    ClearCartUseCase,
    CartMapper,
  ],
})
export class CartApplicationModule {} 