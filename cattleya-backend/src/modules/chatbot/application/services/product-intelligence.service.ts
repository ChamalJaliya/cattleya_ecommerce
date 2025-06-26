import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ICategoryRepository } from '../../../products/domain/repositories/category.repository.interface';
import { ProductMapper } from '../../../products/application/mappers/product.mapper';
import { S3Service } from '../../../../shared/s3/s3.service';
import { extractProductNames } from './nlp-utils';

export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  sku: string;
  defaultSize: string;
  availableSizes: string[];
  primaryColors: string[];
  colorPattern: string;
  averageRating: number;
  totalReviews: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface ProductRecommendation {
  type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival';
  products: ProductSearchResult[];
  reason: string;
}

@Injectable()
export class ProductIntelligenceService {
  private readonly logger = new Logger(ProductIntelligenceService.name);

  constructor(
    @Inject('IProductRepository') public readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository') private readonly categoryRepository: ICategoryRepository,
    private readonly productMapper: ProductMapper,
    private readonly s3Service: S3Service,
  ) {}

  async searchProducts(query: string, limit: number = 5): Promise<ProductSearchResult[]> {
    try {
      this.logger.debug(`[NLP] User query: "${query}"`);
      // Get all product names for NLP matching
      const allProductsResult = await this.productRepository.findAll({}, {}, { page: 1, limit: 1000 });
      const allProductNames = allProductsResult.products.map(p => p.name);
      this.logger.debug(`[NLP] All product names: ${JSON.stringify(allProductNames)}`);
      const extractedNames = extractProductNames(query, allProductNames);
      this.logger.debug(`[NLP] Extracted product names: ${JSON.stringify(extractedNames)}`);

      let products = [];
      if (extractedNames.length > 0) {
        // Try to find products by extracted names (case-insensitive, partial match)
        for (const name of extractedNames) {
          const found = allProductsResult.products.filter(p =>
            p.name.toLowerCase().includes(name.toLowerCase())
          );
          if (found.length > 0) {
            products.push(...found);
          }
        }
      }
      // Fallback: if no products found, do a fuzzy/partial search on all products
      if (products.length === 0) {
        const lowerQuery = query.toLowerCase();
        products = allProductsResult.products.filter(p =>
          lowerQuery.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(lowerQuery)
        );
        this.logger.debug(`[NLP] Fallback product search results: ${JSON.stringify(products.map(p => p.name))}`);
      }
      // Limit results
      products = products.slice(0, limit);
      this.logger.debug(`[NLP] Final product search results: ${JSON.stringify(products.map(p => p.name))}`);
      return await this.mapProductsToSearchResults(products);
    } catch (error) {
      this.logger.error(`[NLP] Error in searchProducts: ${error}`);
      return [];
    }
  }

  async getProductById(id: string): Promise<ProductSearchResult | null> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        return null;
      }

      const category = await this.categoryRepository.findById(product.categoryId);
      
      // Use images that are already included in the product object from the database
      const imageUrls = product.images ? product.images.map((img: any) => img.url) : [];
      
      // Add placeholder if no images
      if (imageUrls.length === 0) {
        imageUrls.push('https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Orchid');
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        defaultSize: product.defaultSize,
        availableSizes: product.availableSizes,
        primaryColors: product.primaryColors,
        colorPattern: product.colorPattern,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        } : {
          id: '',
          name: 'Uncategorized',
          slug: 'uncategorized',
        },
        images: imageUrls,
        tags: product.tags,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      };
    } catch (error) {
      this.logger.error('Error getting product by ID:', error);
      return null;
    }
  }

  async getProductBySlug(slug: string): Promise<ProductSearchResult | null> {
    try {
      const product = await this.productRepository.findBySlug(slug);
      if (!product) {
        return null;
      }

      return this.getProductById(product.id);
    } catch (error) {
      this.logger.error('Error getting product by slug:', error);
      return null;
    }
  }

  async getRecommendations(type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival'): Promise<ProductRecommendation> {
    try {
      let products: ProductSearchResult[] = [];
      let reason = '';

      switch (type) {
        case 'beginner':
          // Search for beginner-friendly orchids (Phalaenopsis, easy care)
          const beginnerProducts = await this.productRepository.search('phalaenopsis beginner easy care', 5);
          products = await this.mapProductsToSearchResults(beginnerProducts);
          reason = 'Perfect for beginners - these orchids are hardy and forgiving';
          break;

        case 'rare':
          // Search for rare or exotic varieties
          const rareProducts = await this.productRepository.search('rare exotic unique specimen', 5);
          products = await this.mapProductsToSearchResults(rareProducts);
          reason = 'Exclusive and rare orchid varieties for collectors';
          break;

        case 'featured':
          // Get featured products
          const featuredProducts = await this.productRepository.findFeatured(5);
          products = await this.mapProductsToSearchResults(featuredProducts);
          reason = 'Our featured orchids - carefully selected for their beauty';
          break;

        case 'best_seller':
          // Get best sellers
          const bestSellers = await this.productRepository.findBestSellers(5);
          products = await this.mapProductsToSearchResults(bestSellers);
          reason = 'Customer favorites - these orchids are loved by many';
          break;

        case 'new_arrival':
          // Get new arrivals
          const newArrivals = await this.productRepository.findNewArrivals(5);
          products = await this.mapProductsToSearchResults(newArrivals);
          reason = 'Fresh arrivals - the latest additions to our collection';
          break;
      }

      return {
        type,
        products,
        reason,
      };
    } catch (error) {
      this.logger.error('Error getting recommendations:', error);
      return {
        type,
        products: [],
        reason: 'Unable to load recommendations at this time',
      };
    }
  }

  async getProductsByCategory(categorySlug: string, limit: number = 5): Promise<ProductSearchResult[]> {
    try {
      const category = await this.categoryRepository.findBySlug(categorySlug);
      if (!category) {
        return [];
      }

      const products = await this.productRepository.findByCategory(category.id, limit);
      return await this.mapProductsToSearchResults(products);
    } catch (error) {
      this.logger.error('Error getting products by category:', error);
      return [];
    }
  }

  async getProductsBySize(size: string, limit: number = 5): Promise<ProductSearchResult[]> {
    try {
      // Search for products with specific size
      const products = await this.productRepository.search(`size ${size}`, limit);
      return await this.mapProductsToSearchResults(products);
    } catch (error) {
      this.logger.error('Error getting products by size:', error);
      return [];
    }
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number, limit: number = 5): Promise<ProductSearchResult[]> {
    try {
      // This would need to be implemented in the repository
      // For now, we'll search and filter
      const products = await this.productRepository.search('orchid', limit * 2);
      const filteredProducts = products.filter(p => 
        p.basePrice >= minPrice && p.basePrice <= maxPrice
      ).slice(0, limit);
      
      return await this.mapProductsToSearchResults(filteredProducts);
    } catch (error) {
      this.logger.error('Error getting products by price range:', error);
      return [];
    }
  }

  async getStockStatus(productId: string): Promise<{ inStock: boolean; quantity: number; status: string }> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        return { inStock: false, quantity: 0, status: 'Product not found' };
      }

      const inStock = product.stockQuantity > 0;
      let status = '';

      if (product.stockQuantity === 0) {
        status = 'Out of stock';
      } else if (product.stockQuantity <= product.lowStockThreshold) {
        status = 'Low stock';
      } else {
        status = 'In stock';
      }

      return {
        inStock,
        quantity: product.stockQuantity,
        status,
      };
    } catch (error) {
      this.logger.error('Error getting stock status:', error);
      return { inStock: false, quantity: 0, status: 'Unable to check stock' };
    }
  }

  public async mapProductsToSearchResults(products: any[]): Promise<ProductSearchResult[]> {
    const results: ProductSearchResult[] = [];

    for (const product of products) {
      const category = await this.categoryRepository.findById(product.categoryId);
      
      // Use images that are already included in the product object from the database
      const imageUrls = product.images ? product.images.map((img: any) => img.url) : [];
      
      // Add placeholder if no images
      if (imageUrls.length === 0) {
        imageUrls.push('https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Orchid');
      }

      results.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        defaultSize: product.defaultSize,
        availableSizes: product.availableSizes,
        primaryColors: product.primaryColors,
        colorPattern: product.colorPattern,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        } : {
          id: '',
          name: 'Uncategorized',
          slug: 'uncategorized',
        },
        images: imageUrls,
        tags: product.tags,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    }

    return results;
  }

  async getProductSummary(): Promise<{
    totalProducts: number;
    categories: string[];
    priceRange: { min: number; max: number };
    sizes: string[];
    featuredCount: number;
  }> {
    try {
      // This would be more efficient with dedicated repository methods
      const allProducts = await this.productRepository.search('', 1000);
      
      const categories = [...new Set(allProducts.map(p => p.categoryId))];
      const prices = allProducts.map(p => p.basePrice);
      const sizes = [...new Set(allProducts.flatMap(p => p.availableSizes))];
      const featuredCount = allProducts.filter(p => p.isFeatured).length;

      return {
        totalProducts: allProducts.length,
        categories: categories,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        sizes: sizes,
        featuredCount,
      };
    } catch (error) {
      this.logger.error('Error getting product summary:', error);
      return {
        totalProducts: 0,
        categories: [],
        priceRange: { min: 0, max: 0 },
        sizes: [],
        featuredCount: 0,
      };
    }
  }
} 