import { Product, OrchidSize, ColorPattern } from '../entities/product.entity';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  orchidSize?: string;
  colorPattern?: string;
  tags?: string[];
}

export interface ProductQuery {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductQueryResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductSortOptions {
  sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'popularity' | 'sales';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  // Basic CRUD operations
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findMany(query: ProductQuery): Promise<ProductQueryResult>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  
  // Advanced search and filtering
  findAll(
    filters?: ProductFilters,
    sortOptions?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<ProductSearchResult>;
  
  search(searchTerm: string, limit?: number): Promise<Product[]>;
  
  // Category-based queries
  findByCategory(categoryId: string, limit?: number): Promise<Product[]>;
  
  // Featured and recommended products
  findFeatured(limit?: number): Promise<Product[]>;
  findBestSellers(limit?: number): Promise<Product[]>;
  findNewArrivals(limit?: number): Promise<Product[]>;
  
  // Stock management
  updateStock(id: string, quantity: number): Promise<Product>;
  
  // Analytics and metrics
  incrementViewCount(id: string): Promise<void>;
  
  // Tag operations
  findByTags(tags: string[]): Promise<Product[]>;
  getAllTags(): Promise<string[]>;
  
  // Price operations
  findByPriceRange(min: number, max: number): Promise<Product[]>;
  findOnSale(): Promise<Product[]>;
  
  // Orchid-specific queries
  findBySize(size: OrchidSize): Promise<Product[]>;
  findByColor(color: string): Promise<Product[]>;
  findByColorPattern(pattern: ColorPattern): Promise<Product[]>;
  
  // Complex queries
  findSimilar(productId: string, limit?: number): Promise<Product[]>;
  findFrequentlyBoughtTogether(productId: string, limit?: number): Promise<Product[]>;
  
  // Admin operations
  findDrafts(): Promise<Product[]>;
  findExpiringSoon(days: number): Promise<Product[]>;
  getInventoryReport(): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  }>;
  
  // Validation
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  existsBySku(sku: string, excludeId?: string): Promise<boolean>;
} 