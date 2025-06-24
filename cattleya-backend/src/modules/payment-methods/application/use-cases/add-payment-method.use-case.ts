import { Injectable, Inject } from '@nestjs/common';
import { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';
import { PaymentMethodMapper } from '../mappers/payment-method.mapper';

@Injectable()
export class AddPaymentMethodUseCase {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string, setupIntentId: string): Promise<PaymentMethodResponseDto> {
    // TODO: Implement actual Stripe integration
    // For now, create a mock payment method
    const paymentMethod = PaymentMethod.create({
      userId,
      stripeId: 'mock_stripe_id_' + Date.now(),
      brand: 'visa',
      last4: '1234',
      expMonth: 12,
      expYear: 2025,
      isDefault: false,
    });

    // Save to database
    const savedPaymentMethod = await this.paymentMethodRepository.create(paymentMethod);
    
    return PaymentMethodMapper.toResponseDto(savedPaymentMethod);
  }
} 