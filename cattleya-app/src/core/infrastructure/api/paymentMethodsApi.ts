import { apiClient } from './apiClient';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  country?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetupIntent {
  clientSecret: string;
  id: string;
}

export class PaymentMethodsApi {
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/payment-methods');
    return response.data;
  }

  static async createSetupIntent(): Promise<SetupIntent> {
    const response = await apiClient.post('/payment-methods/setup-intent');
    return response.data;
  }

  static async addPaymentMethod(setupIntentId: string): Promise<PaymentMethod> {
    const response = await apiClient.post('/payment-methods/add', {
      setupIntentId,
    });
    return response.data;
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`/payment-methods/${id}`);
  }

  static async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await apiClient.put(`/payment-methods/${id}/default`);
    return response.data;
  }
} 