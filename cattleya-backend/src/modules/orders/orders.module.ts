import { Module } from '@nestjs/common';
import { OrdersDomainModule } from './domain/orders.domain.module';
import { OrdersApplicationModule } from './application/orders.application.module';
import { RepositoriesModule } from './infrastructure/repositories.module';
import { OrdersController } from './infrastructure/controllers/orders.controller';

@Module({
  imports: [
    OrdersDomainModule,
    OrdersApplicationModule,
    RepositoriesModule,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {} 