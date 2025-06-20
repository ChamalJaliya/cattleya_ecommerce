import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrchidSize, ColorPattern, AttributeType } from '../../domain/entities/product.entity';

export class ProductImageResponseDto {
  @ApiProperty({ description: 'Image ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  url: string;

  @ApiPropertyOptional({ description: 'Alt text for the image', example: 'Beautiful purple orchid' })
  altText?: string;

  @ApiProperty({ description: 'Whether this is the main product image' })
  isMain: boolean;

  @ApiProperty({ description: 'Sort order for image display' })
  sortOrder: number;

  @ApiPropertyOptional()
  color?: string;

  @ApiPropertyOptional({ enum: OrchidSize })
  size?: OrchidSize;

  @ApiProperty()
  createdAt: Date;
}

export class ProductAttributeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  value: string;

  @ApiProperty({ enum: AttributeType })
  type: AttributeType;
}

export class ProductVariantResponseDto {
  @ApiProperty({ description: 'Variant ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Variant name', example: 'Large Purple' })
  name: string;

  @ApiProperty({ description: 'Variant SKU', example: 'CATT-001-LG' })
  sku: string;

  @ApiProperty({ description: 'Variant price', example: 149.99 })
  price: number;

  @ApiProperty({ description: 'Stock quantity' })
  stockQuantity: number;

  @ApiProperty({ description: 'Whether variant is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Variant images', type: [ProductImageResponseDto] })
  images?: ProductImageResponseDto[];

  @ApiProperty({ type: [ProductAttributeResponseDto] })
  attributes: ProductAttributeResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductCategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Cattleya Orchids' })
  name: string;

  @ApiProperty({ description: 'Category slug', example: 'cattleya-orchids' })
  slug: string;

  @ApiPropertyOptional({ description: 'Category description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Category image' })
  image?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  comment?: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  isVerifiedPurchase: boolean;

  @ApiProperty()
  helpfulVotes: number;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty()
  isVisible: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Cattleya Purple Majesty' })
  name: string;

  @ApiProperty({ description: 'Product slug', example: 'cattleya-purple-majesty' })
  slug: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiPropertyOptional({ description: 'Short product description' })
  shortDescription?: string;

  @ApiProperty({ description: 'Base price', example: 149.99 })
  basePrice: number;

  @ApiProperty({ description: 'Sale price', example: 129.99 })
  salePrice?: number;

  @ApiProperty({ description: 'Whether product is on sale' })
  isOnSale: boolean;

  @ApiProperty({ description: 'Computed display price (sale price if on sale, otherwise base price)' })
  displayPrice: number;

  @ApiProperty({ description: 'Discount percentage if on sale' })
  discountPercentage: number;

  @ApiPropertyOptional({ description: 'Cost price', example: 100.00 })
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'CATT-001' })
  sku?: string;

  @ApiProperty({ description: 'Stock quantity' })
  stockQuantity: number;

  @ApiProperty({ description: 'Low stock threshold' })
  lowStockThreshold: number;

  @ApiProperty({ description: 'Track quantity' })
  trackQuantity: boolean;

  @ApiProperty({ description: 'Whether product is in stock' })
  isInStock: boolean;

  @ApiProperty({ description: 'Whether product is low stock' })
  isLowStock: boolean;

  @ApiProperty({ description: 'Whether product is out of stock' })
  isOutOfStock: boolean;

  @ApiPropertyOptional({ description: 'Product weight', example: 0.5 })
  weight?: number;

  @ApiPropertyOptional({ description: 'Product dimensions', example: '5x7x10 cm' })
  dimensions?: string;

  @ApiPropertyOptional({ description: 'Default orchid size', enum: OrchidSize })
  defaultSize?: OrchidSize;

  @ApiPropertyOptional({ description: 'Available sizes', enum: OrchidSize, isArray: true })
  availableSizes?: OrchidSize[];

  @ApiPropertyOptional({ description: 'Primary colors', example: ['#8B5CF6', '#9333EA'] })
  primaryColors?: string[];

  @ApiPropertyOptional({ description: 'Color pattern', enum: ColorPattern })
  colorPattern?: ColorPattern;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category information', type: ProductCategoryResponseDto })
  category?: ProductCategoryResponseDto;

  @ApiProperty({ description: 'Product images', type: [ProductImageResponseDto] })
  images: ProductImageResponseDto[];

  @ApiPropertyOptional({ description: 'Main product image', type: ProductImageResponseDto })
  mainImage?: ProductImageResponseDto;

  @ApiProperty({ description: 'Product variants', type: [ProductVariantResponseDto] })
  variants: ProductVariantResponseDto[];

  @ApiPropertyOptional({ description: 'Default product variant', type: ProductVariantResponseDto })
  defaultVariant?: ProductVariantResponseDto;

  @ApiProperty({ type: [ProductAttributeResponseDto] })
  attributes: ProductAttributeResponseDto[];

  @ApiPropertyOptional({ description: 'Product tags', example: ['purple', 'fragrant', 'beginner-friendly'] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Meta title', example: 'Cattleya Purple Majesty - Official Website' })
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description', example: 'Discover the beauty and fragrance of Cattleya Purple Majesty orchids' })
  metaDescription?: string;

  @ApiProperty({ description: 'Meta keywords', example: ['cattleya', 'purple', 'majesty', 'orchid', 'fragrant'] })
  metaKeywords: string[];

  @ApiProperty({ description: 'Whether product is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether product is featured' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Whether product is digital' })
  isDigital: boolean;

  @ApiPropertyOptional({ description: 'Publication date', example: '2024-01-15T10:30:00Z' })
  publishedAt?: Date;

  @ApiProperty({ description: 'Average rating', example: 4.5 })
  averageRating: number;

  @ApiProperty({ description: 'Total reviews', example: 24 })
  totalReviews: number;

  @ApiProperty({ description: 'Total sales', example: 100 })
  totalSales: number;

  @ApiProperty({ description: 'View count', example: 500 })
  viewCount: number;

  @ApiProperty({ description: 'Product reviews', type: [ProductReviewResponseDto] })
  reviews: ProductReviewResponseDto[];

  @ApiProperty({ description: 'Creation date', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class ProductListResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ 
    description: 'Paginated products data',
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/ProductResponseDto' }
      },
      total: { type: 'number', description: 'Total number of products' },
      page: { type: 'number', description: 'Current page number' },
      limit: { type: 'number', description: 'Items per page' },
      totalPages: { type: 'number', description: 'Total number of pages' }
    }
  })
  data: {
    items: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ProductInventoryReportDto {
  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  inStock: number;

  @ApiProperty()
  lowStock: number;

  @ApiProperty()
  outOfStock: number;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  averageStockLevel: number;

  @ApiProperty()
  generatedAt: Date;
}

export class ProductAnalyticsResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  sales: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  conversionRate: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  period: string;

  @ApiProperty()
  lastUpdated: Date;
}

export class ProductRecommendationResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  products: ProductResponseDto[];

  @ApiProperty()
  type: string;

  @ApiProperty()
  basedOn?: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  generatedAt: Date;
} 