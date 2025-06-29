import { Controller, Post, Body, Put, Param, Delete, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductVariantService } from '../../application/services/product-variant.service';
import { CreateProductVariantDto } from '../../application/dto/create-product-variant.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Product Variants')
@Controller('products/variants')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @Post()
  create(@Body() dto: CreateProductVariantDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductVariantDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/images')
  getVariantImages(@Param('id') id: string) {
    return this.service.getVariantImages(id);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  async uploadVariantImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() imageData: { altText: string; isMain?: boolean; sortOrder?: number }
  ) {
    // TODO: Implement file upload to S3 or local storage
    // For now, we'll use a placeholder URL
    const imageUrl = file ? `/uploads/variants/${file.filename}` : imageData.altText;
    
    return this.service.uploadVariantImage(id, {
      url: imageUrl,
      altText: imageData.altText,
      isMain: imageData.isMain ?? false,
      sortOrder: imageData.sortOrder ?? 0,
    });
  }

  @Delete('images/:imageId')
  deleteVariantImage(@Param('imageId') imageId: string) {
    return this.service.deleteVariantImage(imageId);
  }

  @Put(':id/images/reorder')
  reorderVariantImages(
    @Param('id') id: string,
    @Body() imageOrder: { id: string; sortOrder: number }[]
  ) {
    return this.service.reorderVariantImages(id, imageOrder);
  }

  @Put(':id/images/:imageId/main')
  setMainImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.service.setMainImage(id, imageId);
  }

  @Post(':id/images/associate')
  associateImagesWithVariant(
    @Param('id') id: string,
    @Body() data: { imageIds: string[] }
  ) {
    return this.service.associateImagesWithVariant(id, data.imageIds);
  }

  @Get('by-product/:productId/combinations')
  getAvailableAttributeCombinations(@Param('productId') productId: string) {
    return this.service.getAvailableAttributeCombinations(productId);
  }

  @Post('by-product/:productId/filter')
  getVariantsByAttributes(
    @Param('productId') productId: string,
    @Body() attributes: Record<string, string>
  ) {
    return this.service.getVariantsByAttributes(productId, attributes);
  }
} 