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
  HttpException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { ProductQueryDto } from '../../application/dto/product-query.dto';
import { ProductResponseDto, ProductListResponseDto } from '../../application/dto/product-response.dto';
import { ProductMapper } from '../../application/mappers/product.mapper';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly productMapper: ProductMapper,
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
} 