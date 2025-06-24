import { forwardRef, Module } from '@nestjs/common';
import { GetWishlistUseCase } from './use-cases/get-wishlist.use-case';
import { AddToWishlistUseCase } from './use-cases/add-to-wishlist.use-case';
import { RemoveFromWishlistUseCase } from './use-cases/remove-from-wishlist.use-case';
import { ClearWishlistUseCase } from './use-cases/clear-wishlist.use-case';
import { WishlistMapper } from './mappers/wishlist.mapper';
import { ProductsInfrastructureModule } from '../../products/infrastructure/products.infrastructure.module';
import { WishlistInfrastructureModule } from '../infrastructure/wishlist.infrastructure.module';

@Module({
  imports: [ProductsInfrastructureModule, forwardRef(() => WishlistInfrastructureModule)],
  providers: [
    GetWishlistUseCase,
    AddToWishlistUseCase,
    RemoveFromWishlistUseCase,
    ClearWishlistUseCase,
    WishlistMapper,
  ],
  exports: [
    GetWishlistUseCase,
    AddToWishlistUseCase,
    RemoveFromWishlistUseCase,
    ClearWishlistUseCase,
    WishlistMapper,
  ],
})
export class WishlistApplicationModule {} 