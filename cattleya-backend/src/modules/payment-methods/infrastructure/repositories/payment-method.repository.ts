import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';

@Injectable()
export class PaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<PaymentMethod[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return paymentMethods.map(pm => new PaymentMethod(pm));
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    return paymentMethod ? new PaymentMethod(paymentMethod) : null;
  }

  async findByStripeId(stripeId: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { stripeId },
    });

    return paymentMethod ? new PaymentMethod(paymentMethod) : null;
  }

  async findDefaultByUserId(userId: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { 
        userId,
        isDefault: true,
      },
    });

    return paymentMethod ? new PaymentMethod(paymentMethod) : null;
  }

  async create(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const created = await this.prisma.paymentMethod.create({
      data: {
        userId: paymentMethod.userId,
        stripeId: paymentMethod.stripeId,
        brand: paymentMethod.brand,
        last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
        isDefault: paymentMethod.isDefault,
      },
    });

    return new PaymentMethod(created);
  }

  async update(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const updated = await this.prisma.paymentMethod.update({
      where: { id: paymentMethod.id },
      data: {
        brand: paymentMethod.brand,
        last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
        isDefault: paymentMethod.isDefault,
        updatedAt: paymentMethod.updatedAt,
      },
    });

    return new PaymentMethod(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async setDefaultForUser(userId: string, paymentMethodId: string): Promise<void> {
    // First, remove default from all user's payment methods
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Then set the specified payment method as default
    await this.prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    });
  }

  async removeDefaultForUser(userId: string): Promise<void> {
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
} 