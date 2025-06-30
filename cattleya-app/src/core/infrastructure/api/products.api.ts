import { BaseApiService, ApiResponse, PaginatedResponse } from './base-api.service';
import { Product } from '../../domain/entities/Product';

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  orchidSize?: string;
  colorPattern?: string;
  isOnSale?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  defaultSize: string;
  availableSizes: string[];
  primaryColors: string[];
  colorPattern: string;
  categoryId: string;
  images: Array<{
    url: string;
    altText: string;
    isMain: boolean;
    sortOrder: number;
  }>;
  attributes: Array<{
    name: string;
    value: string;
    type: string;
  }>;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export class ProductsApiService extends BaseApiService {
  private readonly endpoint = '/products';

  async getProducts(query: ProductsQuery = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return this.get<PaginatedResponse<Product>>(url);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.get<ApiResponse<Product>>(`${this.endpoint}/${id}`);
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.get<ApiResponse<Product[]>>(`${this.endpoint}/featured`);
  }

  async searchProducts(term: string): Promise<ApiResponse<Product[]>> {
    return this.get<ApiResponse<Product[]>>(`${this.endpoint}/search/${encodeURIComponent(term)}`);
  }

  async getProductRecommendations(productId: string): Promise<ApiResponse<Product[]>> {
    return this.get<ApiResponse<Product[]>>(`${this.endpoint}/${productId}/recommendations`);
  }

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return this.post<ApiResponse<Product>>(this.endpoint, data);
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return this.put<ApiResponse<Product>>(`${this.endpoint}/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}

// Export singleton instance
export const productsApi = new ProductsApiService(); 