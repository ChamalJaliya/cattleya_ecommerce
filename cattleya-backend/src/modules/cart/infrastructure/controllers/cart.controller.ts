import { 
  Controller, 
  Get, 
  Post, 
  Put,
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
import { GetCartUseCase } from '../../application/use-cases/get-cart.use-case';
import { AddToCartUseCase } from '../../application/use-cases/add-to-cart.use-case';
import { UpdateCartItemUseCase } from '../../application/use-cases/update-cart-item.use-case';
import { RemoveFromCartUseCase } from '../../application/use-cases/remove-from-cart.use-case';
import { ClearCartUseCase } from '../../application/use-cases/clear-cart.use-case';
import { CartResponseDto, CartItemResponseDto } from '../../application/dto/cart-response.dto';
import { AddToCartDto } from '../../application/dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../../application/dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('customers/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeFromCartUseCase: RemoveFromCartUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get customer cart' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  async getCart(@Request() req): Promise<CartResponseDto> {
    return this.getCartUseCase.execute(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product added to cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid quantity or insufficient stock'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Product not found'
  })
  async addToCart(
    @Request() req,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.addToCartUseCase.execute(req.user.id, dto);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID to update' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart item updated successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid quantity'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cart item not found'
  })
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.updateCartItemUseCase.execute(req.user.id, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID to remove' })
  @ApiResponse({ 
    status: 204, 
    description: 'Item removed from cart successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cart item not found'
  })
  async removeFromCart(
    @Request() req,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.removeFromCartUseCase.execute(req.user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ 
    status: 204, 
    description: 'Cart cleared successfully'
  })
  async clearCart(@Request() req): Promise<void> {
    await this.clearCartUseCase.execute(req.user.id);
  }
} 