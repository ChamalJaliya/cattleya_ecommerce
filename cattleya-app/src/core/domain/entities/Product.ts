export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  category: ProductCategory;
  basePrice: number;
  salePrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isMain: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: VariantAttribute[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: AttributeType;
  isFilterable: boolean;
  sortOrder: number;
}

export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
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
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
} 