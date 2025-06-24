import { Module } from '@nestjs/common';
import { IPaymentMethodRepository } from './repositories/payment-method.repository.interface';

@Module({
  providers: [
    {
      provide: 'IPaymentMethodRepository',
      useValue: null, // This will be overridden by the infrastructure module
    },
  ],
  exports: ['IPaymentMethodRepository'],
})
export class PaymentMethodsDomainModule {} 