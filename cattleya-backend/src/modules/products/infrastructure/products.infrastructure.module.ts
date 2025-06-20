import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsApplicationModule } from '../application/products.application.module';

@Module({
  imports: [
    ProductsApplicationModule,
  ],
  controllers: [ProductsController],
})
export class ProductsInfrastructureModule {} 