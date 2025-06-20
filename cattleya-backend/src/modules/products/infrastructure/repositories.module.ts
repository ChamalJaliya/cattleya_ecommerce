import { Module } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepository,
    },
  ],
  exports: [
    'IProductRepository',
    'ICategoryRepository',
  ],
})
export class RepositoriesModule {} 