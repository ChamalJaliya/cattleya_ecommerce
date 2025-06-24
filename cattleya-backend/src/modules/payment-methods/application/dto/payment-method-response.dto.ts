export class PaymentMethodResponseDto {
  id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  country?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PaymentMethodResponseDto) {
    Object.assign(this, data);
  }
} 