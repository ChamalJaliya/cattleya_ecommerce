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
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

// DTOs
export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  parent?: CategoryResponseDto;
  children?: CategoryResponseDto[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryTreeResponseDto {
  success: boolean;
  data: CategoryResponseDto[];
  total: number;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  includeTree?: boolean;
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'Get all categories publicly (no auth required)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    type: CategoryTreeResponseDto
  })
  @ApiQuery({ name: 'includeTree', required: false, description: 'Include full tree structure' })
  async findAllPublic(@Query('includeTree') includeTree?: boolean) {
    try {
      let categories: Category[];

      if (includeTree) {
        categories = await this.categoryRepository.findTree();
      } else {
        categories = await this.categoryRepository.findAll();
      }

      const responseData = categories.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all categories with optional filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    type: CategoryTreeResponseDto
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Filter by parent ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'includeTree', required: false, description: 'Include full tree structure' })
  async findAll(@Query() query: CategoryQueryDto) {
    try {
      let categories: Category[];

      if (query.includeTree) {
        categories = await this.categoryRepository.findTree();
      } else {
        const filters = {
          searchQuery: query.search,
          parentId: query.parentId,
          isActive: query.isActive
        };
        categories = await this.categoryRepository.findAll(filters);
      }

      const responseData = categories.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tree')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get category tree structure' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category tree retrieved successfully',
    type: CategoryTreeResponseDto
  })
  async getTree() {
    try {
      const categories = await this.categoryRepository.findTree();
      const responseData = categories.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve category tree', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('root')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get root categories only' })
  @ApiResponse({ 
    status: 200, 
    description: 'Root categories retrieved successfully',
    type: CategoryTreeResponseDto
  })
  async getRootCategories() {
    try {
      const categories = await this.categoryRepository.findRootCategories();
      const responseData = categories.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve root categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category found',
    type: CategoryResponseDto
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoryRepository.findById(id);
      
      if (!category) {
        throw new HttpException(
          { success: false, message: 'Category not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: this.mapToResponseDto(category)
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Failed to retrieve category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/children')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get children of a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Children retrieved successfully',
    type: CategoryTreeResponseDto
  })
  async getChildren(@Param('id') id: string) {
    try {
      const children = await this.categoryRepository.findByParent(id);
      const responseData = children.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve children', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/ancestors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get ancestors of a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ancestors retrieved successfully',
    type: CategoryTreeResponseDto
  })
  async getAncestors(@Param('id') id: string) {
    try {
      const ancestors = await this.categoryRepository.getAncestors(id);
      const responseData = ancestors.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve ancestors', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/breadcrumb')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get breadcrumb path for a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Breadcrumb retrieved successfully',
    type: CategoryTreeResponseDto
  })
  async getBreadcrumb(@Param('id') id: string) {
    try {
      const breadcrumb = await this.categoryRepository.getBreadcrumb(id);
      const responseData = breadcrumb.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to retrieve breadcrumb', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Category created successfully',
    type: CategoryResponseDto
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      // Check if slug already exists
      const existingSlug = await this.categoryRepository.existsBySlug(createCategoryDto.slug);
      if (existingSlug) {
        throw new HttpException(
          { success: false, message: 'Category with this slug already exists' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if parent exists if parentId is provided
      if (createCategoryDto.parentId) {
        const parent = await this.categoryRepository.findById(createCategoryDto.parentId);
        if (!parent) {
          throw new HttpException(
            { success: false, message: 'Parent category not found' },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const category = Category.create(createCategoryDto);
      const created = await this.categoryRepository.create(category);

      return {
        success: true,
        data: this.mapToResponseDto(created),
        message: 'Category created successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Failed to create category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Category updated successfully',
    type: CategoryResponseDto
  })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        throw new HttpException(
          { success: false, message: 'Category not found' },
          HttpStatus.NOT_FOUND
        );
      }

      // Check if slug already exists (excluding current category)
      if (updateCategoryDto.slug) {
        const existingSlug = await this.categoryRepository.existsBySlug(updateCategoryDto.slug, id);
        if (existingSlug) {
          throw new HttpException(
            { success: false, message: 'Category with this slug already exists' },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Check if parent exists if parentId is provided
      if (updateCategoryDto.parentId) {
        const parent = await this.categoryRepository.findById(updateCategoryDto.parentId);
        if (!parent) {
          throw new HttpException(
            { success: false, message: 'Parent category not found' },
            HttpStatus.BAD_REQUEST
          );
        }

        // Prevent circular reference
        if (updateCategoryDto.parentId === id) {
          throw new HttpException(
            { success: false, message: 'Category cannot be its own parent' },
            HttpStatus.BAD_REQUEST
          );
        }

        // Check if new parent is a descendant of current category
        const descendants = await this.categoryRepository.getDescendants(id);
        const isDescendant = descendants.some(desc => desc.id === updateCategoryDto.parentId);
        if (isDescendant) {
          throw new HttpException(
            { success: false, message: 'Cannot set a descendant as parent' },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Map DTO fields to entity format
      const updateData: Partial<Category> = {
        name: updateCategoryDto.name,
        slug: updateCategoryDto.slug,
        description: updateCategoryDto.description,
        icon: updateCategoryDto.icon,
        parentId: updateCategoryDto.parentId,
        isActive: updateCategoryDto.isActive,
        sortOrder: updateCategoryDto.sortOrder,
        // Map metaTitle/metaDescription to seoTitle/seoDescription
        seoTitle: updateCategoryDto.metaTitle,
        seoDescription: updateCategoryDto.metaDescription,
      };

      const updated = await this.categoryRepository.update(id, updateData);

      return {
        success: true,
        data: this.mapToResponseDto(updated),
        message: 'Category updated successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Failed to update category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category deleted successfully'
  })
  async remove(@Param('id') id: string) {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new HttpException(
          { success: false, message: 'Category not found' },
          HttpStatus.NOT_FOUND
        );
      }

      const canDelete = await this.categoryRepository.canDelete(id);
      if (!canDelete) {
        throw new HttpException(
          { success: false, message: 'Cannot delete category with products. Please move products to another category first.' },
          HttpStatus.BAD_REQUEST
        );
      }

      await this.categoryRepository.delete(id);

      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Failed to delete category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Activate a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category activated successfully',
    type: CategoryResponseDto
  })
  async activate(@Param('id') id: string) {
    try {
      const activated = await this.categoryRepository.activate(id);
      return {
        success: true,
        data: this.mapToResponseDto(activated),
        message: 'Category activated successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to activate category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Deactivate a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category deactivated successfully',
    type: CategoryResponseDto
  })
  async deactivate(@Param('id') id: string) {
    try {
      const deactivated = await this.categoryRepository.deactivate(id);
      return {
        success: true,
        data: this.mapToResponseDto(deactivated),
        message: 'Category deactivated successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to deactivate category', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/sort')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update category sort order' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ schema: { type: 'object', properties: { sortOrder: { type: 'number' } } } })
  @ApiResponse({ 
    status: 200, 
    description: 'Sort order updated successfully',
    type: CategoryResponseDto
  })
  async updateSortOrder(@Param('id') id: string, @Body('sortOrder') sortOrder: number) {
    try {
      const updated = await this.categoryRepository.updateSortOrder(id, sortOrder);
      return {
        success: true,
        data: this.mapToResponseDto(updated),
        message: 'Sort order updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to update sort order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Reorder multiple categories' })
  @ApiBody({ schema: { type: 'object', properties: { orders: { type: 'array' } } } })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories reordered successfully'
  })
  async reorderCategories(@Body('orders') orders: { id: string; sortOrder: number }[]) {
    try {
      await this.categoryRepository.reorderCategories(orders);
      return {
        success: true,
        message: 'Categories reordered successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to reorder categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('search/:term')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Search categories by term' })
  @ApiParam({ name: 'term', description: 'Search term' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    type: CategoryTreeResponseDto
  })
  async search(@Param('term') term: string) {
    try {
      const results = await this.categoryRepository.search(term);
      const responseData = results.map(cat => this.mapToResponseDto(cat));

      return {
        success: true,
        data: responseData,
        total: responseData.length
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to search categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private mapToResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parentId,
      parent: category.parent ? this.mapToResponseDto(category.parent) : undefined,
      children: category.children ? category.children.map(child => this.mapToResponseDto(child)) : [],
      metaTitle: category.seoTitle,
      metaDescription: category.seoDescription,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: 0, // This would need to be populated from the repository
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
} 