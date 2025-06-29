import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductVariantDto) {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: dto.productId,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
        attributes: dto.attributes,
        isActive: dto.isActive ?? true,
      },
      include: {
        images: true,
      },
    });

    // Associate images with the variant if provided
    if (dto.images && dto.images.length > 0) {
      await this.associateImagesWithVariant(variant.id, dto.images);
    }

    return this.findById(variant.id);
  }

  async update(id: string, dto: Partial<CreateProductVariantDto>) {
    const updateData: any = {};
    
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.attributes !== undefined) updateData.attributes = dto.attributes;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
      },
    });

    // Update image associations if provided
    if (dto.images !== undefined) {
      await this.updateVariantImages(id, dto.images);
    }

    return this.findById(id);
  }

  async delete(id: string) {
    // First, remove all image associations
    await this.prisma.productImage.updateMany({
      where: { variantId: id },
      data: { variantId: null },
    });

    return this.prisma.productVariant.delete({ where: { id } });
  }

  async findByProduct(productId: string) {
    const variants = await this.prisma.productVariant.findMany({ 
      where: { productId },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return Array.isArray(variants) ? variants : [];
  }

  async findById(id: string) {
    return this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        product: {
          include: {
            images: {
              where: { variantId: null }, // Product-level images
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  async associateImagesWithVariant(variantId: string, imageIds: string[]) {
    // First, remove any existing associations for this variant
    await this.prisma.productImage.updateMany({
      where: { variantId },
      data: { variantId: null },
    });

    // Then associate the new images
    if (imageIds.length > 0) {
      await this.prisma.productImage.updateMany({
        where: { 
          id: { in: imageIds },
          productId: { 
            equals: (await this.prisma.productVariant.findUnique({ where: { id: variantId } }))?.productId 
          },
        },
        data: { variantId },
      });
    }
  }

  async updateVariantImages(variantId: string, imageIds: string[]) {
    return this.associateImagesWithVariant(variantId, imageIds);
  }

  async getVariantImages(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        product: {
          include: {
            images: {
              where: { variantId: null }, // Product-level images as fallback
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    // Return variant-specific images, or product images as fallback
    return variant.images.length > 0 ? variant.images : variant.product.images;
  }

  async uploadVariantImage(variantId: string, imageData: {
    url: string;
    altText: string;
    isMain?: boolean;
    sortOrder?: number;
  }) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    return this.prisma.productImage.create({
      data: {
        productId: variant.productId,
        variantId,
        url: imageData.url,
        altText: imageData.altText,
        isMain: imageData.isMain ?? false,
        sortOrder: imageData.sortOrder ?? 0,
      },
    });
  }

  async deleteVariantImage(imageId: string) {
    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async reorderVariantImages(variantId: string, imageOrder: { id: string; sortOrder: number }[]) {
    const updates = imageOrder.map(({ id, sortOrder }) =>
      this.prisma.productImage.update({
        where: { id, variantId },
        data: { sortOrder },
      })
    );

    await this.prisma.$transaction(updates);
    return this.getVariantImages(variantId);
  }

  async setMainImage(variantId: string, imageId: string) {
    // First, unset all main images for this variant
    await this.prisma.productImage.updateMany({
      where: { variantId },
      data: { isMain: false },
    });

    // Then set the new main image
    return this.prisma.productImage.update({
      where: { id: imageId, variantId },
      data: { isMain: true },
    });
  }

  async getVariantsByAttributes(productId: string, attributes: Record<string, string>) {
    // For MongoDB with Prisma, we need to use a different approach for JSON queries
    // We'll fetch all variants and filter them in memory for now
    const allVariants = await this.prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Filter variants that match all the provided attributes
    return allVariants.filter(variant => {
      const variantAttributes = variant.attributes as Record<string, any>;
      return Object.entries(attributes).every(([key, value]) => 
        variantAttributes[key] === value
      );
    });
  }

  async getAvailableAttributeCombinations(productId: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { 
        productId,
        isActive: true,
        stock: { gt: 0 },
      },
      select: { attributes: true },
    });

    return variants.map(variant => variant.attributes as Record<string, string>);
  }
} 