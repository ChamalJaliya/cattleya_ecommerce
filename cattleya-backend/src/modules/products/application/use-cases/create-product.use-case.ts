import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { IAttributeSetsRepository } from '../../../attribute-sets/domain/repositories/attribute-sets.repository';
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
    @Inject('IAttributeSetsRepository') private readonly attributeSetsRepository: IAttributeSetsRepository,
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

    // Verify attribute set exists if provided
    if (request.attributeSetId) {
      const attributeSet = await this.attributeSetsRepository.findById(request.attributeSetId);
      if (!attributeSet) {
        throw new NotFoundException('Attribute set not found');
      }

      // Validate that product attributes match the attribute set
      if (request.attributes) {
        await this.validateProductAttributes(request.attributes, attributeSet);
      }

      // Validate variant attributes if variants are provided
      if (request.variants) {
        for (const variant of request.variants) {
          if (variant.attributes) {
            await this.validateVariantAttributes(variant.attributes, attributeSet);
          }
        }
      }
    }

    // Create product entity using static factory method
    const productProps = this.productMapper.toDomainEntity(request) as any;
    const product = Product.create(productProps);

    // Save product
    const createdProduct = await this.productRepository.create(product);
    
    // Return response with category information
    return this.productMapper.toProductResponseDto(createdProduct);
  }

  private async validateProductAttributes(attributes: any[], attributeSet: any): Promise<void> {
    const attributeSetCodes = attributeSet.attributes.map((attr: any) => attr.code);
    
    for (const attr of attributes) {
      if (!attributeSetCodes.includes(attr.code)) {
        throw new NotFoundException(`Attribute with code '${attr.code}' not found in attribute set`);
      }
    }
  }

  private async validateVariantAttributes(attributes: any[], attributeSet: any): Promise<void> {
    const attributeSetCodes = attributeSet.attributes.map((attr: any) => attr.code);
    
    for (const attr of attributes) {
      if (!attributeSetCodes.includes(attr.code)) {
        throw new NotFoundException(`Variant attribute with code '${attr.code}' not found in attribute set`);
      }
    }
  }
} 