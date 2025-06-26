import { Module } from '@nestjs/common';
import { ProductsInfrastructureModule } from './infrastructure/products.infrastructure.module';
import { ProductsApplicationModule } from './application/products.application.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [ProductsInfrastructureModule, ProductsApplicationModule, SharedModule],
  exports: [
    ProductsInfrastructureModule,
    ProductsApplicationModule,
  ],
})
export class ProductsModule {} 