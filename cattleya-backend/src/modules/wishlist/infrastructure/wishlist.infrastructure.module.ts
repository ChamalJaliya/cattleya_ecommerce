import { forwardRef, Module } from '@nestjs/common';
import { WishlistApplicationModule } from '../application/wishlist.application.module';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistRepository } from './repositories/wishlist.repository';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';

@Module({
  imports: [forwardRef(() => WishlistApplicationModule), PrismaModule],
  controllers: [WishlistController],
  providers: [
    {
      provide: 'IWishlistRepository',
      useClass: WishlistRepository,
    },
  ],
  exports: ['IWishlistRepository'],
})
export class WishlistInfrastructureModule {} 