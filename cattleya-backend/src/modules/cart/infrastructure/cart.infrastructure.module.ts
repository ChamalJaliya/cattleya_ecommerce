import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartRepository } from './repositories/cart.repository';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';
import { CartApplicationModule } from '../application/cart.application.module';

@Module({
  imports: [PrismaModule, CartApplicationModule],
  controllers: [CartController],
  providers: [CartRepository],
  exports: [CartRepository],
})
export class CartInfrastructureModule {} 