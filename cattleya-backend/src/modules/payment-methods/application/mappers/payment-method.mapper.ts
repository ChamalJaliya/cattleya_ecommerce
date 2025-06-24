import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';

export class PaymentMethodMapper {
  static toResponseDto(paymentMethod: PaymentMethod): PaymentMethodResponseDto {
    return new PaymentMethodResponseDto({
      id: paymentMethod.id,
      type: 'card', // Default to card since we only support cards for now
      brand: paymentMethod.brand,
      last4: paymentMethod.last4,
      expMonth: paymentMethod.expMonth,
      expYear: paymentMethod.expYear,
      country: undefined, // Not stored in our schema
      isDefault: paymentMethod.isDefault,
      createdAt: paymentMethod.createdAt,
      updatedAt: paymentMethod.updatedAt,
    });
  }

  static toResponseDtoList(paymentMethods: PaymentMethod[]): PaymentMethodResponseDto[] {
    return paymentMethods.map(this.toResponseDto);
  }
} 