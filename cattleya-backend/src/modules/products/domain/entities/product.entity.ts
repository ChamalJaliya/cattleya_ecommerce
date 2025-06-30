import { AttributeType } from '@prisma/client';

export enum OrchidSize {
  SEEDLING = 'seedling',
  SAPLING = 'sapling',
  YOUNG_PLANT = 'young_plant',
  MATURE = 'mature',
  BLOOMING_SIZE = 'blooming_size',
  SPECIMEN = 'specimen'
}

export enum ColorPattern {
  SOLID = 'solid',
  BICOLOR = 'bicolor',
  MULTICOLOR = 'multicolor',
  VARIEGATED = 'variegated'
}

export interface ProductImage {
  id?: string;
  productId?: string;
  url: string;
  altText: string;
  isMain: boolean;
  sortOrder: number;
  color?: string;
  size?: OrchidSize;
  createdAt?: Date;
}

export interface ProductAttribute {
  id?: string;
  name: string;
  value: string;
  type: AttributeType;
}

export interface ProductVariant {
  id?: string;
  productId?: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  size: OrchidSize;
  colors: string[];
  isDefault: boolean;
  attributes?: ProductAttribute[];
  images: ProductImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductProps {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  isOnSale?: boolean;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
  trackQuantity?: boolean;
  weight?: number;
  dimensions?: string;
  defaultSize: OrchidSize;
  availableSizes: OrchidSize[];
  primaryColors: string[];
  colorPattern: ColorPattern;
  categoryId: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  publishedAt?: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly shortDescription: string | null,
    public readonly basePrice: number,
    public readonly salePrice: number | null,
    public readonly isOnSale: boolean,
    public readonly sku: string,
    public readonly stock: number,
    public readonly lowStockThreshold: number,
    public readonly trackQuantity: boolean,
    public readonly weight: number | null,
    public readonly dimensions: string | null,
    public readonly defaultSize: OrchidSize,
    public readonly availableSizes: OrchidSize[],
    public readonly primaryColors: string[],
    public readonly colorPattern: ColorPattern,
    public readonly categoryId: string,
    public readonly images: ProductImage[],
    public readonly variants: ProductVariant[],
    public readonly attributes: ProductAttribute[],
    public readonly tags: string[],
    public readonly metaTitle: string | null,
    public readonly metaDescription: string | null,
    public readonly metaKeywords: string[],
    public readonly isActive: boolean,
    public readonly isFeatured: boolean,
    public readonly isDigital: boolean,
    public readonly averageRating: number,
    public readonly totalReviews: number,
    public readonly totalSales: number,
    public readonly viewCount: number,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: CreateProductProps): Product {
    const now = new Date();
    
    return new Product(
      '', // Will be set by repository
      props.name,
      props.slug,
      props.description,
      props.shortDescription || null,
      props.basePrice,
      props.salePrice || null,
      props.isOnSale || false,
      props.sku,
      props.stock,
      props.lowStockThreshold || 5,
      props.trackQuantity !== false,
      props.weight || null,
      props.dimensions || null,
      props.defaultSize,
      props.availableSizes,
      props.primaryColors,
      props.colorPattern,
      props.categoryId,
      props.images || [],
      props.variants || [],
      props.attributes || [],
      props.tags || [],
      props.metaTitle || null,
      props.metaDescription || null,
      props.metaKeywords || [],
      props.isActive !== false,
      props.isFeatured || false,
      props.isDigital || false,
      0, // averageRating
      0, // totalReviews
      0, // totalSales
      0, // viewCount
      props.publishedAt || null,
      now,
      now,
    );
  }

  get displayPrice(): number {
    return this.isOnSale && this.salePrice ? this.salePrice : this.basePrice;
  }

  get discountPercentage(): number {
    if (!this.isOnSale || !this.salePrice) return 0;
    return Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
  }

  get isInStock(): boolean {
    return this.stock > 0;
  }

  get isLowStock(): boolean {
    return this.stock <= this.lowStockThreshold;
  }

  get mainImage(): ProductImage | null {
    return this.images.find(img => img.isMain) || this.images[0] || null;
  }

  get allImages(): ProductImage[] {
    return [...this.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  get defaultVariant(): ProductVariant | undefined {
    return this.variants.find(variant => variant.isDefault);
  }

  getVariantsBySize(size: OrchidSize): ProductVariant[] {
    return this.variants.filter(variant => variant.size === size);
  }

  getVariantsByColor(color: string): ProductVariant[] {
    return this.variants.filter(variant => variant.colors.includes(color));
  }

  updateStock(quantity: number): Product {
    return new Product(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.shortDescription,
      this.basePrice,
      this.salePrice,
      this.isOnSale,
      this.sku,
      quantity,
      this.lowStockThreshold,
      this.trackQuantity,
      this.weight,
      this.dimensions,
      this.defaultSize,
      this.availableSizes,
      this.primaryColors,
      this.colorPattern,
      this.categoryId,
      this.images,
      this.variants,
      this.attributes,
      this.tags,
      this.metaTitle,
      this.metaDescription,
      this.metaKeywords,
      this.isActive,
      this.isFeatured,
      this.isDigital,
      this.averageRating,
      this.totalReviews,
      this.totalSales,
      this.viewCount,
      this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  updateRating(rating: number, reviewsCount: number): Product {
    return new Product(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.shortDescription,
      this.basePrice,
      this.salePrice,
      this.isOnSale,
      this.sku,
      this.stock,
      this.lowStockThreshold,
      this.trackQuantity,
      this.weight,
      this.dimensions,
      this.defaultSize,
      this.availableSizes,
      this.primaryColors,
      this.colorPattern,
      this.categoryId,
      this.images,
      this.variants,
      this.attributes,
      this.tags,
      this.metaTitle,
      this.metaDescription,
      this.metaKeywords,
      this.isActive,
      this.isFeatured,
      this.isDigital,
      rating,
      reviewsCount,
      this.totalSales,
      this.viewCount,
      this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  
} 