import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { CartRepositoryInterface } from '../../domain/repositories/cart.repository.interface';
import { CartEntity } from '../../domain/entities/cart.entity';

@Injectable()
export class CartRepository implements CartRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<any> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: `cart-${userId}`,
      userId,
      items: cartItems,
      createdAt: cartItems.length > 0 ? cartItems[0].createdAt : new Date(),
      updatedAt: cartItems.length > 0 ? cartItems[0].updatedAt : new Date(),
    };
  }

  async addItem(userId: string, data: any): Promise<any> {
    const { productId, quantity, selectedAttributes } = data;

    // Check if item already exists in cart with the same productId
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          selectedAttributes,
        },
      });

      return this.findByUserId(userId);
    }

    // Create new cart item
    await this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        selectedAttributes,
      },
    });

    return this.findByUserId(userId);
  }

  async updateItem(userId: string, itemId: string, data: any): Promise<any> {
    const { quantity, selectedAttributes } = data;

    await this.prisma.cartItem.update({
      where: {
        id: itemId,
        userId, // Ensure user owns this item
      },
      data: {
        quantity,
        selectedAttributes,
      },
    });

    return this.findByUserId(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: {
        id: itemId,
        userId, // Ensure user owns this item
      },
    });
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
} 