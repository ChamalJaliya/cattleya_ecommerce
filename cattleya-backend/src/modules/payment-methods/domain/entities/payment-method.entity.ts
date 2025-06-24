export class PaymentMethod {
  id: string;
  userId: string;
  stripeId: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<PaymentMethod>) {
    Object.assign(this, data);
  }

  static create(data: {
    userId: string;
    stripeId: string;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    isDefault: boolean;
  }): PaymentMethod {
    return new PaymentMethod({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  setAsDefault(): void {
    this.isDefault = true;
    this.updatedAt = new Date();
  }

  removeDefault(): void {
    this.isDefault = false;
    this.updatedAt = new Date();
  }

  updateLast4(last4: string): void {
    this.last4 = last4;
    this.updatedAt = new Date();
  }

  updateExpiry(expMonth: number, expYear: number): void {
    this.expMonth = expMonth;
    this.expYear = expYear;
    this.updatedAt = new Date();
  }
} 