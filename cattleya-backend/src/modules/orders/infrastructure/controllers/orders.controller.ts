import { Controller, Get, Query, Param, Put, Body, UseGuards, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { GetOrdersUseCase } from '../../../orders/application/use-cases/get-orders.use-case';
import { GetOrderUseCase } from '../../../orders/application/use-cases/get-order.use-case';
import { UpdateOrderUseCase } from '../../../orders/application/use-cases/update-order.use-case';
import { GetOrderStatsUseCase } from '../../../orders/application/use-cases/get-order-stats.use-case';
import { OrderQueryDto } from '../../../orders/application/dto/order-query.dto';
import { UpdateOrderDto } from '../../../orders/application/dto/update-order.dto';
import { OrderResponseDto } from '../../../orders/application/dto/order-response.dto';
import { OrderMapper } from '../../../orders/application/mappers/order.mapper';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class OrdersController {
  constructor(
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly getOrderStatsUseCase: GetOrderStatsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders (paginated, filterable)' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async getOrders(@Query() query: OrderQueryDto) {
    const { orders, total, page, limit, totalPages } = await this.getOrdersUseCase.execute(query);
    return {
      success: true,
      data: {
        items: orders.map(OrderMapper.toResponseDto),
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order stats for dashboard' })
  async getStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const { stats } = await this.getOrderStatsUseCase.execute({ startDate, endDate });
    return { success: true, data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async getOrder(@Param('id') id: string) {
    const { order } = await this.getOrderUseCase.execute({ id });
    if (!order) throw new NotFoundException('Order not found');
    return { success: true, data: OrderMapper.toResponseDto(order) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order (status, payment, tracking, etc.)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    const { order } = await this.updateOrderUseCase.execute({ id, ...dto });
    return { success: true, data: OrderMapper.toResponseDto(order) };
  }

  // Print endpoint (returns HTML for now, can be extended to PDF)
  @Get(':id/print')
  @ApiOperation({ summary: 'Get printable order (HTML)' })
  async printOrder(@Param('id') id: string) {
    const { order } = await this.getOrderUseCase.execute({ id });
    if (!order) throw new NotFoundException('Order not found');
    // For now, return a simple HTML string. In production, use a template engine or PDF generator.
    const dto = OrderMapper.toResponseDto(order);
    const html = `
      <html><head><title>Order ${dto.number}</title></head><body>
      <h1>Order #${dto.number}</h1>
      <p>Status: ${dto.status}</p>
      <p>Customer: ${dto.customerFullName} (${dto.email})</p>
      <p>Total: ${dto.formattedTotal}</p>
      <h2>Items</h2>
      <ul>
        ${dto.items.map(item => `<li>${item.quantity}x ${item.productName} - $${item.price.toFixed(2)}</li>`).join('')}
      </ul>
      <h2>Shipping Address</h2>
      <p>${dto.shippingAddress.firstName} ${dto.shippingAddress.lastName}, ${dto.shippingAddress.street}, ${dto.shippingAddress.city}, ${dto.shippingAddress.state}, ${dto.shippingAddress.zipCode}, ${dto.shippingAddress.country}</p>
      </body></html>
    `;
    return html;
  }
} 