import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';
import { OrderRepository } from './repositories/order.repository';

export const ORDERS_REPOSITORY = 'ORDERS_REPOSITORY';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: ORDERS_REPOSITORY, useClass: OrderRepository },
    OrderRepository,
  ],
  exports: [ORDERS_REPOSITORY, OrderRepository],
})
export class RepositoriesModule {} 