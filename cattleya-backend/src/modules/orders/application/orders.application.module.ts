import { Module, forwardRef } from '@nestjs/common';
import { GetOrdersUseCase } from './use-cases/get-orders.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';
import { UpdateOrderUseCase } from './use-cases/update-order.use-case';
import { GetOrderStatsUseCase } from './use-cases/get-order-stats.use-case';
import { RepositoriesModule, ORDERS_REPOSITORY } from '../infrastructure/repositories.module';

@Module({
  imports: [forwardRef(() => RepositoriesModule)],
  providers: [
    {
      provide: GetOrdersUseCase,
      useFactory: (orderRepo) => new GetOrdersUseCase(orderRepo),
      inject: [ORDERS_REPOSITORY],
    },
    {
      provide: GetOrderUseCase,
      useFactory: (orderRepo) => new GetOrderUseCase(orderRepo),
      inject: [ORDERS_REPOSITORY],
    },
    {
      provide: UpdateOrderUseCase,
      useFactory: (orderRepo) => new UpdateOrderUseCase(orderRepo),
      inject: [ORDERS_REPOSITORY],
    },
    {
      provide: GetOrderStatsUseCase,
      useFactory: (orderRepo) => new GetOrderStatsUseCase(orderRepo),
      inject: [ORDERS_REPOSITORY],
    },
  ],
  exports: [
    GetOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderUseCase,
    GetOrderStatsUseCase,
  ],
})
export class OrdersApplicationModule {} 