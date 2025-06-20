import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductMapper } from '../mappers/product.mapper';
import { Product } from '../../domain/entities/product.entity';

export interface CreateProductRequest extends CreateProductDto {}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository') private readonly categoryRepository: ICategoryRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async execute(request: CreateProductRequest): Promise<ProductResponseDto> {
    // Check if product with SKU already exists
    const existingProduct = await this.productRepository.findBySku(request.sku);
    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if slug already exists
    const existingSlug = await this.productRepository.findBySlug(request.slug);
    if (existingSlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    // Verify category exists
    const category = await this.categoryRepository.findById(request.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Create product entity using static factory method
    const productProps = this.productMapper.toDomainEntity(request) as any;
    const product = Product.create(productProps);

    // Save product
    const createdProduct = await this.productRepository.create(product);
    
    // Return response with category information
    return this.productMapper.toProductResponseDto(createdProduct);
  }
} 