import { Injectable, Inject } from '@nestjs/common';
import { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class DeletePaymentMethodUseCase {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string, paymentMethodId: string): Promise<void> {
    // Get the payment method from database
    const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new Error('Unauthorized to delete this payment method');
    }

    // TODO: Implement actual Stripe integration
    // await this.stripeService.detachPaymentMethod(paymentMethod.stripeId);

    // Delete from database
    await this.paymentMethodRepository.delete(paymentMethodId);
  }
} 