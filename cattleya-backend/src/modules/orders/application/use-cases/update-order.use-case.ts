import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, UpdateOrderProps } from '../../domain/entities/order.entity';

export interface UpdateOrderRequest {
  id: string;
  status?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
  notes?: string;
  customerNotes?: string;
}

export interface UpdateOrderResponse {
  order: Order;
}

@Injectable()
export class UpdateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    const existingOrder = await this.orderRepository.findById(request.id);
    
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${request.id} not found`);
    }

    const updateProps: UpdateOrderProps = {
      status: request.status as any,
      paymentStatus: request.paymentStatus as any,
      trackingNumber: request.trackingNumber,
      shippedAt: request.shippedAt ? new Date(request.shippedAt) : undefined,
      deliveredAt: request.deliveredAt ? new Date(request.deliveredAt) : undefined,
      paidAt: request.paidAt ? new Date(request.paidAt) : undefined,
      notes: request.notes,
      customerNotes: request.customerNotes,
    };

    const updatedOrder = existingOrder.update(updateProps);
    const savedOrder = await this.orderRepository.update(request.id, updatedOrder);

    return { order: savedOrder };
  }
} 