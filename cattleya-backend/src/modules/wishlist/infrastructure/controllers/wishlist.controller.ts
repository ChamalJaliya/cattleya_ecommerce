import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetWishlistUseCase } from '../../application/use-cases/get-wishlist.use-case';
import { AddToWishlistUseCase } from '../../application/use-cases/add-to-wishlist.use-case';
import { RemoveFromWishlistUseCase } from '../../application/use-cases/remove-from-wishlist.use-case';
import { ClearWishlistUseCase } from '../../application/use-cases/clear-wishlist.use-case';
import { WishlistResponseDto } from '../../application/dto/wishlist-response.dto';
import { AddToWishlistDto } from '../../application/dto/add-to-wishlist.dto';

@ApiTags('Wishlist')
@Controller('customers/wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(
    private readonly getWishlistUseCase: GetWishlistUseCase,
    private readonly addToWishlistUseCase: AddToWishlistUseCase,
    private readonly removeFromWishlistUseCase: RemoveFromWishlistUseCase,
    private readonly clearWishlistUseCase: ClearWishlistUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get customer wishlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wishlist retrieved successfully',
    type: WishlistResponseDto,
  })
  async getWishlist(@Request() req): Promise<WishlistResponseDto> {
    return this.getWishlistUseCase.execute(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product added to wishlist successfully'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Product already in wishlist or product not found'
  })
  async addToWishlist(
    @Request() req,
    @Body() dto: AddToWishlistDto,
  ): Promise<void> {
    await this.addToWishlistUseCase.execute(req.user.id, dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', description: 'Product ID to remove' })
  @ApiResponse({ 
    status: 204, 
    description: 'Product removed from wishlist successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Item not found in wishlist'
  })
  async removeFromWishlist(
    @Request() req,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.removeFromWishlistUseCase.execute(req.user.id, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear entire wishlist' })
  @ApiResponse({ 
    status: 204, 
    description: 'Wishlist cleared successfully'
  })
  async clearWishlist(@Request() req): Promise<void> {
    await this.clearWishlistUseCase.execute(req.user.id);
  }
} 