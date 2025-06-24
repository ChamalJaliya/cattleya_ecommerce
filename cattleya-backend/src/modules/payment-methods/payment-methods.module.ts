import { Module } from '@nestjs/common';
import { PaymentMethodsApplicationModule } from './application/payment-methods.application.module';
import { PaymentMethodsInfrastructureModule } from './infrastructure/payment-methods.infrastructure.module';

@Module({
  imports: [
    PaymentMethodsApplicationModule,
    PaymentMethodsInfrastructureModule,
  ],
})
export class PaymentMethodsModule {} 