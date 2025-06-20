import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ProductsDomainModule } from './domain/products.domain.module';
import { ProductsApplicationModule } from './application/products.application.module';
import { ProductsInfrastructureModule } from './infrastructure/products.infrastructure.module';

@Module({
  imports: [
    SharedModule,
    ProductsDomainModule,
    ProductsApplicationModule,
    ProductsInfrastructureModule,
  ],
  exports: [
    ProductsApplicationModule,
    ProductsInfrastructureModule,
  ],
})
export class ProductsModule {} 