import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../../domain/entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  productId: string;

  @ApiProperty({ example: 'Cattleya Orchid Premium' })
  productName: string;

  @ApiProperty({ example: 'cattleya-orchid-premium' })
  productSlug: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  productImage?: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 149.99 })
  price: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  variantId?: string;

  @ApiProperty({ example: 'Blooming Size - Purple' })
  variantName?: string;

  @ApiProperty({ example: 299.98 })
  subtotal: number;
}

export class OrderAddressResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439014' })
  id: string;

  @ApiProperty({ example: 'shipping' })
  type: 'shipping' | 'billing';

  @ApiProperty({ example: 'Home' })
  label?: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'Acme Corp' })
  company?: string;

  @ApiProperty({ example: '123 Garden St' })
  street: string;

  @ApiProperty({ example: 'Apt 4B' })
  apartment?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiProperty({ example: '10001' })
  zipCode: string;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: '+1234567890' })
  phone?: string;
}

export class OrderCustomerResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439015' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'JS' })
  avatar?: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439016' })
  id: string;

  @ApiProperty({ example: 'ORD-001' })
  number: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '507f1f77bcf86cd799439015' })
  userId: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: 149.99 })
  subtotal: number;

  @ApiProperty({ example: 14.99 })
  taxAmount: number;

  @ApiProperty({ example: 9.99 })
  shippingFee: number;

  @ApiProperty({ example: 0 })
  discount: number;

  @ApiProperty({ example: 174.97 })
  total: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'credit_card' })
  paymentMethod?: string;

  @ApiProperty({ example: '2024-01-15T09:00:00Z' })
  paidAt?: string;

  @ApiProperty({ example: 'standard_shipping' })
  shippingMethod?: string;

  @ApiProperty({ example: 'TRK123456789' })
  trackingNumber?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  shippedAt?: string;

  @ApiProperty({ example: '2024-01-18T14:00:00Z' })
  deliveredAt?: string;

  @ApiProperty({ example: 'Order notes from admin' })
  notes?: string;

  @ApiProperty({ example: 'Customer notes' })
  customerNotes?: string;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  updatedAt: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ type: OrderAddressResponseDto })
  shippingAddress: OrderAddressResponseDto;

  @ApiProperty({ type: OrderAddressResponseDto })
  billingAddress: OrderAddressResponseDto;

  @ApiProperty({ type: OrderCustomerResponseDto })
  customer: OrderCustomerResponseDto;

  // Computed properties
  @ApiProperty({ example: true })
  isPaid: boolean;

  @ApiProperty({ example: false })
  isShipped: boolean;

  @ApiProperty({ example: false })
  isDelivered: boolean;

  @ApiProperty({ example: false })
  isCancelled: boolean;

  @ApiProperty({ example: true })
  canBeCancelled: boolean;

  @ApiProperty({ example: false })
  canBeShipped: boolean;

  @ApiProperty({ example: false })
  canBeDelivered: boolean;

  @ApiProperty({ example: 'John Smith' })
  customerFullName: string;

  @ApiProperty({ example: 2 })
  itemsCount: number;

  @ApiProperty({ example: '$174.97' })
  formattedTotal: string;
} 