import { Module } from '@nestjs/common';
import { CartApplicationModule } from './application/cart.application.module';
import { CartDomainModule } from './domain/cart.domain.module';
import { CartInfrastructureModule } from './infrastructure/cart.infrastructure.module';

@Module({
  imports: [CartApplicationModule, CartDomainModule, CartInfrastructureModule],
})
export class CartModule {} 