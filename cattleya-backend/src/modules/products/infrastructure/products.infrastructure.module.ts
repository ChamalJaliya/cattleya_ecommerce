import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsApplicationModule } from '../application/products.application.module';
import { SharedModule } from '../../../shared/shared.module';

@Module({
  imports: [
    ProductsApplicationModule,
    SharedModule
  ],
  controllers: [ProductsController],
})
export class ProductsInfrastructureModule {} 