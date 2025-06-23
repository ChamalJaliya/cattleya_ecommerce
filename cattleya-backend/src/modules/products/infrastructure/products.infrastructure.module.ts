import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsApplicationModule } from '../application/products.application.module';
import { SharedModule } from '../../../shared/shared.module';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [
    ProductsApplicationModule,
    SharedModule
  ],
  controllers: [ProductsController, CategoriesController],
  providers: [CategoryRepository],
})
export class ProductsInfrastructureModule {} 