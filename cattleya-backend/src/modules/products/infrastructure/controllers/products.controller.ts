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
    const start = Date.now();
    try {
      const result = await this.getProductsUseCase.findMany(query);
      const elapsed = Date.now() - start;
      console.log(`[PERF] GET /api/products - ${elapsed}ms`);
      return result;
    } catch (error) {
      const elapsed = Date.now() - start;
      console.log(`[PERF] GET /api/products - ERROR after ${elapsed}ms`);
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

  @Get('all')
  @ApiOperation({ summary: 'Get all products as flat array (no pagination)' })
  @ApiResponse({ 
    status: 200, 
    description: 'All products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ProductResponseDto' } }
      }
    }
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Filter by featured status' })
  async findAllFlat(@Query('isActive') isActive?: boolean, @Query('isFeatured') isFeatured?: boolean) {
    const start = Date.now();
    try {
      // Create a query that gets all products without pagination
      const query = {
        page: 1,
        limit: 1000, // Large limit to get all products
        isActive: isActive,
        isFeatured: isFeatured,
      };
      
      const result = await this.getProductsUseCase.findMany(query);
      const elapsed = Date.now() - start;
      console.log(`[PERF] GET /api/products/all - ${elapsed}ms`);
      
      // Return flat array of products
      return {
        success: true,
        data: result.data.items || []
      };
    } catch (error) {
      const elapsed = Date.now() - start;
      console.log(`[PERF] GET /api/products/all - ERROR after ${elapsed}ms`);
      throw new HttpException(
        { success: false, message: 'Failed to retrieve all products', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('media')
  @ApiOperation({ summary: 'List all media files (scalable, supports any top-level folder)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by file type' })
  @ApiQuery({ name: 'folder', required: false, description: 'Filter by folder (top-level, e.g., media, products, etc.)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by filename' })
  @ApiResponse({ status: 200, description: 'Media files retrieved successfully', type: [MediaFileDto] })
  async listMedia(
    @Query('type') type?: string,
    @Query('folder') folder?: string,
    @Query('search') search?: string,
  ): Promise<MediaFile[]> {
    let files: MediaFile[];
    // Use the folder as prefix if provided, otherwise use bucket root ('')
    const prefix = folder ? folder : '';
    files = await this.s3Service.listFiles(prefix);
    if (type) {
      files = files.filter(file => file.type === type);
    }
    if (search) {
      files = files.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return files;
  }

  @Get('media/folders')
  async listFolders(@Query('prefix') prefix?: string) {
    // List folders at the given prefix, or root if not provided
    return this.s3Service.listFolders(prefix || '');
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

  @Post('media/folders')
  async createFolder(@Body('folderName') folderName: string) {
    if (!folderName || /[\\:*?"<>|]/.test(folderName)) {
      throw new HttpException('Invalid folder name', HttpStatus.BAD_REQUEST);
    }
    return this.s3Service.createFolder(folderName);
  }

  @Get('files')
  @ApiOperation({ summary: 'List all files in a specific folder (dynamic, any top-level folder)' })
  @ApiQuery({ name: 'folder', required: true, description: 'Top-level folder name (e.g., media, products, etc.)' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully', type: [MediaFileDto] })
  async listFilesInFolder(@Query('folder') folder: string): Promise<MediaFile[]> {
    if (!folder) {
      throw new HttpException('Folder query parameter is required', HttpStatus.BAD_REQUEST);
    }
    // List all files under the given folder (e.g., 'media', 'products', etc.)
    return this.s3Service.listFiles(folder);
  }
} 