import { Module } from '@nestjs/common';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';
import { CartRepository } from '../infrastructure/repositories/cart.repository';

@Module({
  providers: [
    {
      provide: 'CartRepositoryInterface',
      useClass: CartRepository,
    },
  ],
  exports: ['CartRepositoryInterface'],
})
export class CartDomainModule {} 