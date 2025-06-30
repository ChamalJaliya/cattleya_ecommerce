import { apiClient } from './apiClient';

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isMain: boolean;
  sortOrder: number;
  color?: string;
  size?: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  displayPrice: number;
  isInStock: boolean;
  stock: number;
  images: ProductImage[];
  mainImage?: ProductImage;
  category?: ProductCategory;
  averageRating?: number;
  reviews?: number;
  // ...add more fields as needed
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  totalItems: number;
  totalValue: number;
  items: WishlistItem[];
}

export interface AddToWishlistRequest {
  productId: string;
}

export class WishlistApi {
  static async getWishlist(): Promise<Wishlist> {
    const response = await apiClient.get('/customers/wishlist');
    return response.data.data;
  }

  static async addToWishlist(productId: string): Promise<void> {
    await apiClient.post('/customers/wishlist', { productId });
  }

  static async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`/customers/wishlist/${productId}`);
  }

  static async clearWishlist(): Promise<void> {
    await apiClient.delete('/customers/wishlist');
  }
} 