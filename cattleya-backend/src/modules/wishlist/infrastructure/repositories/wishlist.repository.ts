import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IWishlistRepository } from '../../domain/repositories/wishlist.repository.interface';
import { Wishlist } from '../../domain/entities/wishlist.entity';

@Injectable()
export class WishlistRepository implements IWishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Wishlist[]> {
    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return wishlistItems.map(item => new Wishlist(
      item.id,
      item.userId,
      item.productId,
      item.createdAt,
      item.createdAt,
    ));
  }

  async findByUserIdAndProductId(userId: string, productId: string): Promise<Wishlist | null> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!item) return null;

    return new Wishlist(
      item.id,
      item.userId,
      item.productId,
      item.createdAt,
      item.createdAt,
    );
  }

  async create(wishlist: Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wishlist> {
    const created = await this.prisma.wishlistItem.create({
      data: {
        userId: wishlist.userId,
        productId: wishlist.productId,
      },
    });

    return new Wishlist(
      created.id,
      created.userId,
      created.productId,
      created.createdAt,
      created.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wishlistItem.delete({
      where: { id },
    });
  }

  async deleteByUserIdAndProductId(userId: string, productId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.wishlistItem.count({
      where: { userId },
    });
  }
} 