import { Wishlist } from '../entities/wishlist.entity';

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<Wishlist[]>;
  findByUserIdAndProductId(userId: string, productId: string): Promise<Wishlist | null>;
  create(wishlist: Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wishlist>;
  delete(id: string): Promise<void>;
  deleteByUserIdAndProductId(userId: string, productId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
} 