import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductResponseDto, ProductListResponseDto } from '../dto/product-response.dto';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository') private readonly categoryRepository: ICategoryRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async findMany(query: ProductQueryDto): Promise<ProductListResponseDto> {
    const queryParams = {
      filters: {
        search: query.search,
        categoryId: query.categoryId,
        isActive: query.isActive,
        isFeatured: query.isFeatured,
        isOnSale: query.isOnSale,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        orchidSize: query.orchidSize,
        colorPattern: query.colorPattern,
        tags: query.tags,
      },
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const result = await this.productRepository.findMany(queryParams);
    
    // Get categories for the returned products
    const categoryIds = [...new Set(result.products.map(p => p.categoryId))];
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findByParentId(null) // This should be improved to get specific categories
      : [];

    return this.productMapper.toProductListResponseDto(result);
  }

  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const category = await this.categoryRepository.findById(product.categoryId);
    return this.productMapper.toProductResponseDto(product);
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const category = await this.categoryRepository.findById(product.categoryId);
    
    // Increment view count
    await this.productRepository.incrementViewCount(product.id);
    
    return this.productMapper.toProductResponseDto(product);
  }

  async findFeatured(limit: number = 5): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findFeatured(limit);
    
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findByParentId(null) // This should be improved
      : [];

    return products.map(product => this.productMapper.toProductResponseDto(product));
  }

  async findByCategory(categoryId: string, limit: number = 10): Promise<ProductResponseDto[]> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const products = await this.productRepository.findByCategory(categoryId, limit);
    return products.map(product => this.productMapper.toProductResponseDto(product));
  }

  async findBestSellers(limit: number = 5): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findBestSellers(limit);
    
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findByParentId(null) // This should be improved
      : [];

    return products.map(product => this.productMapper.toProductResponseDto(product));
  }

  async findNewArrivals(limit: number = 5): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findNewArrivals(limit);
    
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findByParentId(null) // This should be improved
      : [];

    return products.map(product => this.productMapper.toProductResponseDto(product));
  }

  async search(searchTerm: string, limit: number = 10): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.search(searchTerm, limit);
    
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findByParentId(null) // This should be improved
      : [];

    return products.map(product => this.productMapper.toProductResponseDto(product));
  }
} 