import { Module } from '@nestjs/common';
import { WishlistDomainModule } from './domain/wishlist.domain.module';
import { WishlistApplicationModule } from './application/wishlist.application.module';
import { WishlistInfrastructureModule } from './infrastructure/wishlist.infrastructure.module';

@Module({
  imports: [
    WishlistDomainModule,
    WishlistApplicationModule,
    WishlistInfrastructureModule,
  ],
})
export class WishlistModule {} 