import { Module } from '@nestjs/common';
import { ProductsInfrastructureModule } from './infrastructure/products.infrastructure.module';
import { ProductsApplicationModule } from './application/products.application.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductVariantService } from './application/services/product-variant.service';
import { ProductVariantController } from './infrastructure/controllers/product-variant.controller';

@Module({
  imports: [ProductsInfrastructureModule, ProductsApplicationModule, SharedModule],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  exports: [
    ProductsInfrastructureModule,
    ProductsApplicationModule,
    ProductVariantService,
  ],
})
export class ProductsModule {} 