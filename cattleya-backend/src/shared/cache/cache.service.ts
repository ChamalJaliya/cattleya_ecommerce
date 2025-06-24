import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  // Cache key generators
  static getProductKey(id: string): string {
    return `product:${id}`;
  }

  static getProductsKey(filters?: any): string {
    const filterString = filters ? JSON.stringify(filters) : 'all';
    return `products:${filterString}`;
  }

  static getCategoryKey(id: string): string {
    return `category:${id}`;
  }

  static getCategoriesKey(includeTree: boolean): string {
    return `categories:${includeTree}`;
  }

  static getUserKey(id: string): string {
    return `user:${id}`;
  }

  static getCartKey(userId: string): string {
    return `cart:${userId}`;
  }
} 