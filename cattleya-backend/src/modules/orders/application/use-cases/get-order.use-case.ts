import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

export interface GetOrderRequest {
  id: string;
}

export interface GetOrderResponse {
  order: Order;
}

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: GetOrderRequest): Promise<GetOrderResponse> {
    const order = await this.orderRepository.findById(request.id);
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${request.id} not found`);
    }

    return { order };
  }
} 