import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
  Req,
  UploadedFiles,
  Res
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { ProductQueryDto } from '../../application/dto/product-query.dto';
import { ProductResponseDto, ProductListResponseDto } from '../../application/dto/product-response.dto';
import { ProductMapper } from '../../application/mappers/product.mapper';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service, MediaFile, UploadResult } from '../../../../shared/s3/s3.service';
import { Response } from 'express';
import { 
  MediaFileDto, 
  UploadResultDto, 
  MediaStatsDto, 
  DownloadUrlDto, 
  DeleteResponseDto, 
  BulkDeleteResponseDto, 
  MoveResponseDto 
} from '../dto/media-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly productMapper: ProductMapper,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Products retrieved successfully',
    type: ProductListResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Filter by featured status' })
  async findAll(@Query() query: ProductQueryDto) {
    try {
      const result = await this.getProductsUseCase.findMany(query);

      return result;
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve products', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ 
    status: 200, 
    description: 'Featured products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ProductResponseDto' } }
      }
    }
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of featured products (default: 8)' })
  async findFeatured(@Query('limit') limit?: number) {
    try {
      const products = await this.getProductsUseCase.findFeatured(limit || 8);

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve featured products', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('media')
  @ApiOperation({ summary: 'List all media files' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by file type' })
  @ApiQuery({ name: 'folder', required: false, description: 'Filter by folder' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by filename' })
  @ApiResponse({ status: 200, description: 'Media files retrieved successfully', type: [MediaFileDto] })
  async listMedia(
    @Query('type') type?: string,
    @Query('folder') folder?: string,
    @Query('search') search?: string,
  ): Promise<MediaFile[]> {
    let files: MediaFile[];

    if (folder) {
      files = await this.s3Service.listFilesByFolder(folder);
    } else if (type) {
      files = await this.s3Service.listFilesByType(type);
    } else {
      files = await this.s3Service.listFiles();
    }

    if (search) {
      files = files.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return files;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/ProductResponseDto' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    try {
      // For now, return mock data since we're focusing on compilation
      return {
        success: true,
        data: {
          id,
          name: 'Mock Product',
          slug: 'mock-product',
          description: 'This is a mock product',
          basePrice: 29.99,
          stockQuantity: 10,
          isActive: true,
          isFeatured: false,
          averageRating: 4.5,
          reviewCount: 0,
          category: {
            id: 'mock-category-id',
            name: 'Mock Category',
            slug: 'mock-category'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Product not found' },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/ProductResponseDto' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const productResponse = await this.createProductUseCase.execute(createProductDto);
      return {
        success: true,
        data: productResponse,
        message: 'Product created successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to create product', error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/ProductResponseDto' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      // Mock implementation for now
      return {
        success: true,
        data: { id, ...updateProductDto },
        message: 'Product updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to update product', error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    try {
      // Mock implementation for now
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to delete product', error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Search products by term' })
  @ApiParam({ name: 'term', description: 'Search term', example: 'cattleya purple' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum search results (default: 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ProductResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            searchTerm: { type: 'string' },
            total: { type: 'number' }
          }
        }
      }
    }
  })
  async search(@Param('term') term: string, @Query('limit') limit?: number) {
    try {
      const products = await this.getProductsUseCase.search(term, limit || 20);

      return {
        success: true,
        data: products,
        meta: {
          searchTerm: term,
          total: products.length
        }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Search failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload to (optional)',
          example: 'products',
        },
        metadata: {
          type: 'string',
          description: 'JSON metadata (optional)',
          example: '{"uploadedBy": "admin", "category": "product"}',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: UploadResultDto })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('metadata') metadata?: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const parsedMetadata = metadata ? JSON.parse(metadata) : {};
    return this.s3Service.uploadFile(file, folder || 'media', parsedMetadata);
  }

  @Post('media/upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple media files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload to (optional)',
          example: 'products',
        },
        metadata: {
          type: 'string',
          description: 'JSON metadata (optional)',
          example: '{"uploadedBy": "admin", "category": "product"}',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully', type: [UploadResultDto] })
  async uploadMultipleMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
    @Body('metadata') metadata?: string,
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const parsedMetadata = metadata ? JSON.parse(metadata) : {};
    return this.s3Service.uploadMultipleFiles(files, folder || 'media', parsedMetadata);
  }

  @Get('media/stats')
  @ApiOperation({ summary: 'Get media storage statistics' })
  @ApiResponse({ status: 200, description: 'Storage stats retrieved successfully', type: MediaStatsDto })
  async getMediaStats() {
    const stats = await this.s3Service.getStorageStats();
    return {
      ...stats,
      totalSizeFormatted: this.s3Service.formatFileSize(stats.totalSize),
      byType: Object.entries(stats.byType).reduce((acc, [type, data]) => {
        acc[type] = {
          ...data,
          sizeFormatted: this.s3Service.formatFileSize(data.size),
          icon: this.s3Service.getFileIcon(type),
        };
        return acc;
      }, {} as Record<string, any>),
      byFolder: Object.entries(stats.byFolder).reduce((acc, [folder, data]) => {
        acc[folder] = {
          ...data,
          sizeFormatted: this.s3Service.formatFileSize(data.size),
        };
        return acc;
      }, {} as Record<string, any>),
    };
  }

  @Get('media/:key')
  @ApiOperation({ summary: 'Get specific media file info' })
  @ApiParam({ name: 'key', description: 'File key in S3' })
  @ApiResponse({ status: 200, description: 'File info retrieved successfully', type: MediaFileDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getMediaInfo(@Param('key') key: string): Promise<MediaFile> {
    const file = await this.s3Service.getFileInfo(key);
    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return file;
  }

  @Get('media/:key/download')
  @ApiOperation({ summary: 'Get signed download URL for media file' })
  @ApiParam({ name: 'key', description: 'File key in S3' })
  @ApiQuery({ name: 'expiresIn', required: false, description: 'URL expiration time in seconds', example: '3600' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully', type: DownloadUrlDto })
  async getDownloadUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn) : 3600;
    const url = await this.s3Service.getSignedUrl(key, expiresInSeconds);
    return { url, expiresIn: expiresInSeconds };
  }

  @Delete('media/:key')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiParam({ name: 'key', description: 'File key in S3' })
  @ApiResponse({ status: 200, description: 'File deleted successfully', type: DeleteResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteMedia(@Param('key') key: string): Promise<{ message: string }> {
    await this.s3Service.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  @Delete('media/bulk-delete')
  @ApiOperation({ summary: 'Delete multiple media files' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file keys to delete',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Files deleted successfully', type: BulkDeleteResponseDto })
  async deleteMultipleMedia(@Body('keys') keys: string[]): Promise<{ message: string; deletedCount: number }> {
    if (!keys || keys.length === 0) {
      throw new HttpException('No keys provided', HttpStatus.BAD_REQUEST);
    }

    await this.s3Service.deleteMultipleFiles(keys);
    return { message: 'Files deleted successfully', deletedCount: keys.length };
  }

  @Post('media/:key/move')
  @ApiOperation({ summary: 'Move a media file to a different location' })
  @ApiParam({ name: 'key', description: 'Current file key in S3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        destinationKey: {
          type: 'string',
          description: 'New file key',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File moved successfully', type: MoveResponseDto })
  async moveMedia(
    @Param('key') key: string,
    @Body('destinationKey') destinationKey: string,
  ): Promise<{ message: string; newKey: string }> {
    await this.s3Service.moveFile(key, destinationKey);
    return { message: 'File moved successfully', newKey: destinationKey };
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Upload product images' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product images uploaded successfully', type: [UploadResultDto] })
  async uploadProductImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<UploadResult[]> {
    if (!images || images.length === 0) {
      throw new HttpException('No images provided', HttpStatus.BAD_REQUEST);
    }

    const metadata = {
      uploadedBy: 'admin',
      category: 'product',
      productId: id,
    };

    return this.s3Service.uploadMultipleFiles(images, `products/${id}/images`, metadata);
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get product images' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product images retrieved successfully', type: [MediaFileDto] })
  async getProductImages(@Param('id') id: string): Promise<MediaFile[]> {
    return this.s3Service.listFilesByFolder(`products/${id}/images`);
  }

  @Delete(':id/images/:imageKey')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageKey', description: 'Image key in S3' })
  @ApiResponse({ status: 200, description: 'Product image deleted successfully', type: DeleteResponseDto })
  async deleteProductImage(
    @Param('id') id: string,
    @Param('imageKey') imageKey: string,
  ): Promise<{ message: string }> {
    await this.s3Service.deleteFile(imageKey);
    return { message: 'Product image deleted successfully' };
  }

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Upload a document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description: 'Document to upload',
        },
        category: {
          type: 'string',
          description: 'Document category',
          example: 'manuals',
        },
        metadata: {
          type: 'string',
          description: 'JSON metadata (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: UploadResultDto })
  async uploadDocument(
    @UploadedFile() document: Express.Multer.File,
    @Body('category') category?: string,
    @Body('metadata') metadata?: string,
  ): Promise<UploadResult> {
    if (!document) {
      throw new HttpException('No document provided', HttpStatus.BAD_REQUEST);
    }

    const parsedMetadata = metadata ? JSON.parse(metadata) : {};
    const folder = `documents/${category || 'general'}`;
    
    return this.s3Service.uploadFile(document, folder, {
      ...parsedMetadata,
      uploadedBy: 'admin',
      category: 'document',
    });
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all documents' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by document category' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully', type: [MediaFileDto] })
  async listDocuments(@Query('category') category?: string): Promise<MediaFile[]> {
    if (category) {
      return this.s3Service.listFilesByFolder(`documents/${category}`);
    }
    return this.s3Service.listFiles('documents');
  }

  @Post('sharables/upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload sharable content files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
        type: {
          type: 'string',
          description: 'Content type',
          example: 'social-media',
        },
        metadata: {
          type: 'string',
          description: 'JSON metadata (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Sharable content uploaded successfully', type: [UploadResultDto] })
  async uploadSharableContent(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('type') type?: string,
    @Body('metadata') metadata?: string,
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const parsedMetadata = metadata ? JSON.parse(metadata) : {};
    const folder = `sharables/${type || 'general'}`;
    
    return this.s3Service.uploadMultipleFiles(files, folder, {
      ...parsedMetadata,
      uploadedBy: 'admin',
      category: 'sharable',
    });
  }

  @Get('sharables')
  @ApiOperation({ summary: 'List all sharable content' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by content type' })
  @ApiResponse({ status: 200, description: 'Sharable content retrieved successfully', type: [MediaFileDto] })
  async listSharableContent(@Query('type') type?: string): Promise<MediaFile[]> {
    if (type) {
      return this.s3Service.listFilesByFolder(`sharables/${type}`);
    }
    return this.s3Service.listFiles('sharables');
  }
} 