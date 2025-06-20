import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './use-cases/create-product.use-case';
import { GetProductsUseCase } from './use-cases/get-products.use-case';
import { ProductMapper } from './mappers/product.mapper';
import { RepositoriesModule } from '../infrastructure/repositories.module';

@Module({
  imports: [
    RepositoriesModule,
  ],
  providers: [
    CreateProductUseCase,
    GetProductsUseCase,
    ProductMapper,
  ],
  exports: [
    CreateProductUseCase,
    GetProductsUseCase,
    ProductMapper,
  ],
})
export class ProductsApplicationModule {} 