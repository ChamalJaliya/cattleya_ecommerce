import { Injectable } from '@nestjs/common';
import { IOrderRepository, OrderQueryOptions } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

export interface GetOrdersRequest {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    const options: OrderQueryOptions = {
      page: request.page || 1,
      limit: request.limit || 10,
      search: request.search,
      status: request.status as any,
      paymentStatus: request.paymentStatus as any,
      userId: request.userId,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      endDate: request.endDate ? new Date(request.endDate) : undefined,
      sortBy: request.sortBy as any,
      sortOrder: request.sortOrder || 'desc',
    };

    return this.orderRepository.findAll(options);
  }
} 