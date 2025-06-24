import { PaymentMethod } from '../entities/payment-method.entity';

export interface IPaymentMethodRepository {
  findByUserId(userId: string): Promise<PaymentMethod[]>;
  findById(id: string): Promise<PaymentMethod | null>;
  findByStripeId(stripeId: string): Promise<PaymentMethod | null>;
  findDefaultByUserId(userId: string): Promise<PaymentMethod | null>;
  create(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
  update(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
  setDefaultForUser(userId: string, paymentMethodId: string): Promise<void>;
  removeDefaultForUser(userId: string): Promise<void>;
} 