export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  weight?: number;
  dimensions?: string;
  
  // Orchid-specific properties
  defaultSize: OrchidSize;
  availableSizes: OrchidSize[];
  primaryColors: string[]; // Main colors (for bicolor/multicolor)
  colorPattern: ColorPattern;
  
  category: ProductCategory;
  categoryId?: string;
  images: ProductImage[];
  variants?: ProductVariant[]; // Different size/color combinations
  attributes: ProductAttribute[];
  tags: string[];
  
  // SEO and metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Product status
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  
  // Analytics
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isMain: boolean;
  sortOrder: number;
  createdAt: Date;
  color?: string; // Associated color
  size?: string; // Associated size
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Purple - Blooming Size", "Bicolor Pink/White - Young Plant"
  sku: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  size: OrchidSize;
  colors: string[]; // Array of hex colors for multicolor support
  isDefault: boolean;
  attributes?: ProductAttribute[];
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'COLOR' | 'SIZE';
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  COLOR = 'COLOR',
  SIZE = 'SIZE'
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrchidSize {
  SEEDLING = 'seedling',        // 0-6 months, very small
  SAPLING = 'sapling',          // 6-12 months, small pot
  YOUNG_PLANT = 'young_plant',  // 1-2 years, established roots
  MATURE = 'mature',            // 2-3 years, strong growth
  BLOOMING_SIZE = 'blooming_size', // 3+ years, ready to bloom
  SPECIMEN = 'specimen'         // 5+ years, large mature plant
}

export enum ColorPattern {
  SOLID = 'solid',
  BICOLOR = 'bicolor',
  MULTICOLOR = 'multicolor',
  VARIEGATED = 'variegated'
} 