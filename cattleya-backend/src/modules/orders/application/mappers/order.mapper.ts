import { Order, OrderItem, OrderAddress } from '../../domain/entities/order.entity';
import { OrderResponseDto, OrderItemResponseDto, OrderAddressResponseDto, OrderCustomerResponseDto } from '../dto/order-response.dto';

export class OrderMapper {
  static toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      userId: order.userId,
      email: order.email,
      phone: order.phone || undefined,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || undefined,
      paidAt: order.paidAt?.toISOString(),
      shippingMethod: order.shippingMethod || undefined,
      trackingNumber: order.trackingNumber || undefined,
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      notes: order.notes || undefined,
      customerNotes: order.customerNotes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => this.toItemResponseDto(item)),
      shippingAddress: order.shippingAddress ? this.toAddressResponseDto(order.shippingAddress) : undefined,
      billingAddress: order.billingAddress ? this.toAddressResponseDto(order.billingAddress) : undefined,
      customer: order.customer ? this.toCustomerResponseDto(order.customer) : undefined,
      // Computed properties
      isPaid: order.isPaid,
      isShipped: order.isShipped,
      isDelivered: order.isDelivered,
      isCancelled: order.isCancelled,
      canBeCancelled: order.canBeCancelled,
      canBeShipped: order.canBeShipped,
      canBeDelivered: order.canBeDelivered,
      customerFullName: order.customerFullName,
      itemsCount: order.itemsCount,
      formattedTotal: order.formattedTotal,
    };
  }

  static toItemResponseDto(item: OrderItem): OrderItemResponseDto {
    return {
      id: item.id || '',
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
      variantId: item.variantId,
      variantName: item.variantName,
      subtotal: item.subtotal,
    };
  }

  static toAddressResponseDto(address: OrderAddress): OrderAddressResponseDto {
    return {
      id: address.id || '',
      type: address.type,
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
    };
  }

  static toCustomerResponseDto(customer: { id: string; firstName: string; lastName: string; email: string; avatar?: string }): OrderCustomerResponseDto {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      avatar: customer.avatar,
    };
  }
} 