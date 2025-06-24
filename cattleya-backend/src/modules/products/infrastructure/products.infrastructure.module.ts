import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsApplicationModule } from '../application/products.application.module';
import { SharedModule } from '../../../shared/shared.module';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [
    ProductsApplicationModule,
    SharedModule
  ],
  controllers: [ProductsController, CategoriesController],
  providers: [
    CategoryRepository,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: [
    'IProductRepository',
  ],
})
export class ProductsInfrastructureModule {} 