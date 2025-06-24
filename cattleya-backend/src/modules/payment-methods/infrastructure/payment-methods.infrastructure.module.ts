import { Module } from '@nestjs/common';
import { PaymentMethodsApplicationModule } from '../application/payment-methods.application.module';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { PaymentMethodRepository } from './repositories/payment-method.repository';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';

@Module({
  imports: [PaymentMethodsApplicationModule, PrismaModule],
  controllers: [PaymentMethodsController],
  providers: [
    {
      provide: 'IPaymentMethodRepository',
      useClass: PaymentMethodRepository,
    },
  ],
  exports: ['IPaymentMethodRepository'],
})
export class PaymentMethodsInfrastructureModule {} 