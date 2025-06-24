import { Injectable, Inject } from '@nestjs/common';
import { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';
import { PaymentMethodMapper } from '../mappers/payment-method.mapper';

@Injectable()
export class GetPaymentMethodsUseCase {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string): Promise<PaymentMethodResponseDto[]> {
    const paymentMethods = await this.paymentMethodRepository.findByUserId(userId);
    return PaymentMethodMapper.toResponseDtoList(paymentMethods);
  }
} 