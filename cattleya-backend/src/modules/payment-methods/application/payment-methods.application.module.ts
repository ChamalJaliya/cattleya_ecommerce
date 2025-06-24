import { Module } from '@nestjs/common';
import { PaymentMethodsDomainModule } from '../domain/payment-methods.domain.module';
import { GetPaymentMethodsUseCase } from './use-cases/get-payment-methods.use-case';
import { CreateSetupIntentUseCase } from './use-cases/create-setup-intent.use-case';
import { AddPaymentMethodUseCase } from './use-cases/add-payment-method.use-case';
import { DeletePaymentMethodUseCase } from './use-cases/delete-payment-method.use-case';
import { SetDefaultPaymentMethodUseCase } from './use-cases/set-default-payment-method.use-case';

@Module({
  imports: [PaymentMethodsDomainModule],
  providers: [
    GetPaymentMethodsUseCase,
    CreateSetupIntentUseCase,
    AddPaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    SetDefaultPaymentMethodUseCase,
  ],
  exports: [
    GetPaymentMethodsUseCase,
    CreateSetupIntentUseCase,
    AddPaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    SetDefaultPaymentMethodUseCase,
  ],
})
export class PaymentMethodsApplicationModule {} 