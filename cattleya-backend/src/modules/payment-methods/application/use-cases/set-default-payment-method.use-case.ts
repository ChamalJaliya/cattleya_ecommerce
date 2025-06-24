import { Injectable, Inject } from '@nestjs/common';
import { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';
import { PaymentMethodMapper } from '../mappers/payment-method.mapper';

@Injectable()
export class SetDefaultPaymentMethodUseCase {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string, paymentMethodId: string): Promise<PaymentMethodResponseDto> {
    // Get the payment method from database
    const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new Error('Unauthorized to modify this payment method');
    }

    // Set as default
    await this.paymentMethodRepository.setDefaultForUser(userId, paymentMethodId);
    
    // Get updated payment method
    const updatedPaymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
    
    return PaymentMethodMapper.toResponseDto(updatedPaymentMethod!);
  }
} 