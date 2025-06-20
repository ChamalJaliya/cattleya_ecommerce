import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductResponseDto, ProductListResponseDto } from '../dto/product-response.dto';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductMapper {
  toProductResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      isOnSale: product.isOnSale,
      displayPrice: product.displayPrice,
      discountPercentage: product.discountPercentage,
      costPrice: undefined,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      trackQuantity: product.trackQuantity,
      isInStock: product.isInStock,
      isLowStock: product.isLowStock,
      isOutOfStock: !product.isInStock,
      weight: product.weight,
      dimensions: product.dimensions,
      defaultSize: product.defaultSize,
      availableSizes: product.availableSizes,
      primaryColors: product.primaryColors,
      colorPattern: product.colorPattern,
      categoryId: product.categoryId,
      category: undefined,
      images: product.images.map(image => ({
        id: image.id || '',
        url: image.url,
        altText: image.altText || '',
        isMain: image.isMain,
        sortOrder: image.sortOrder,
        color: image.color,
        size: image.size,
        createdAt: image.createdAt || new Date()
      })),
      mainImage: product.mainImage ? {
        id: product.mainImage.id || '',
        url: product.mainImage.url,
        altText: product.mainImage.altText || '',
        isMain: product.mainImage.isMain,
        sortOrder: product.mainImage.sortOrder,
        color: product.mainImage.color,
        size: product.mainImage.size,
        createdAt: product.mainImage.createdAt || new Date()
      } : undefined,
      variants: product.variants.map(variant => ({
        id: variant.id || '',
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        isActive: true,
        images: variant.images.map(image => ({
          id: image.id || '',
          url: image.url,
          altText: image.altText || '',
          isMain: image.isMain,
          sortOrder: image.sortOrder,
          color: image.color,
          size: image.size,
          createdAt: image.createdAt || new Date()
        })),
        attributes: variant.attributes?.map(attr => ({
          id: attr.id || '',
          name: attr.name,
          value: attr.value,
          type: attr.type
        })) || [],
        createdAt: variant.createdAt || new Date(),
        updatedAt: variant.updatedAt || new Date()
      })),
      defaultVariant: product.defaultVariant ? {
        id: product.defaultVariant.id || '',
        name: product.defaultVariant.name,
        sku: product.defaultVariant.sku,
        price: product.defaultVariant.price,
        stockQuantity: product.defaultVariant.stockQuantity,
        isActive: true,
        images: [],
        attributes: [],
        createdAt: product.defaultVariant.createdAt || new Date(),
        updatedAt: product.defaultVariant.updatedAt || new Date()
      } : undefined,
      attributes: product.attributes.map(attr => ({
        id: attr.id || '',
        name: attr.name,
        value: attr.value,
        type: attr.type
      })),
      tags: product.tags,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      metaKeywords: product.metaKeywords || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isDigital: product.isDigital,
      publishedAt: product.publishedAt,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      totalSales: product.totalSales,
      viewCount: product.viewCount,
      reviews: [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  toDomainEntity(dto: CreateProductDto): Partial<Product> {
    return {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      shortDescription: dto.shortDescription,
      basePrice: dto.basePrice,
      salePrice: dto.salePrice,
      isOnSale: dto.isOnSale,
      sku: dto.sku,
      stockQuantity: dto.stockQuantity,
      lowStockThreshold: dto.lowStockThreshold,
      trackQuantity: dto.trackQuantity,
      weight: dto.weight,
      dimensions: dto.dimensions,
      defaultSize: dto.defaultSize,
      availableSizes: dto.availableSizes,
      primaryColors: dto.primaryColors,
      colorPattern: dto.colorPattern,
      categoryId: dto.categoryId,
      images: dto.images?.map(img => ({
        url: img.url,
        altText: img.altText,
        isMain: img.isMain || false,
        sortOrder: img.sortOrder || 0,
        color: img.color,
        size: img.size,
      })) || [],
      attributes: [],
      tags: dto.tags,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      metaKeywords: dto.metaKeywords,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      isFeatured: dto.isFeatured || false,
      isDigital: dto.isDigital || false,
      publishedAt: dto.publishedAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  toProductListResponseDto(result: any): ProductListResponseDto {
    return {
      success: true,
      data: result.products.map(product =>
        this.toProductResponseDto(product)
      ),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    };
  }
} 