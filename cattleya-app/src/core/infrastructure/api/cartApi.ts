import { apiClient } from './apiClient';

// Product-related interfaces
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
}

// Cart-related interfaces
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variantId?: string;
  selectedAttributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

// API Request interfaces
export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
  selectedAttributes?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  quantity: number;
  variantId?: string;
  selectedAttributes?: Record<string, any>;
}

// Backend response interfaces
export interface BackendCartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  selectedAttributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    displayPrice: number;
    isInStock: boolean;
    stock: number;
    images: ProductImage[];
    category?: ProductCategory;
    averageRating?: number;
    reviews?: number;
  };
}

export interface BackendCartResponse {
  id: string;
  userId: string;
  items: BackendCartItem[];
  createdAt: string;
  updatedAt: string;
}

export class CartApi {
  private static transformCartItem(backendItem: BackendCartItem): CartItem {
    return {
      id: backendItem.id,
      product: {
        ...backendItem.product,
        mainImage: backendItem.product.images.find(img => img.isMain) || backendItem.product.images[0],
      },
      quantity: backendItem.quantity,
      variantId: backendItem.variantId,
      selectedAttributes: backendItem.selectedAttributes,
      createdAt: backendItem.createdAt,
      updatedAt: backendItem.updatedAt,
    };
  }

  private static transformCartResponse(backendCart: BackendCartResponse): Cart {
    const items = (backendCart.items || []).map(this.transformCartItem);
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.product.basePrice * item.quantity);
    }, 0);
    
    return {
      id: backendCart.id,
      userId: backendCart.userId,
      items,
      totalItems,
      totalValue,
      createdAt: backendCart.createdAt,
      updatedAt: backendCart.updatedAt,
    };
  }

  static async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get('/customers/cart');
      const cartData = response.data.data;
      
      // Handle case where cart might be null or undefined
      if (!cartData || !cartData.items) {
        return {
          id: 'empty-cart',
          userId: '',
          items: [],
          totalItems: 0,
          totalValue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      return this.transformCartResponse(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Return empty cart on error
      return {
        id: 'error-cart',
        userId: '',
        items: [],
        totalItems: 0,
        totalValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  static async addToCart(data: AddToCartRequest): Promise<Cart> {
    try {
      const response = await apiClient.post('/customers/cart', data);
      const cartData = response.data.data;
      
      if (!cartData || !cartData.items) {
        throw new Error('Invalid cart response');
      }
      
      return this.transformCartResponse(cartData);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  static async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    try {
      const response = await apiClient.put(`/customers/cart/${itemId}`, data);
      const cartData = response.data.data;
      
      if (!cartData || !cartData.items) {
        throw new Error('Invalid cart response');
      }
      
      return this.transformCartResponse(cartData);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async removeFromCart(itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/customers/cart/${itemId}`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  static async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/customers/cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
} 