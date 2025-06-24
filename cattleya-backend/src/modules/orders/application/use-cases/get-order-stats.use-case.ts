import { Injectable } from '@nestjs/common';
import { IOrderRepository, OrderStats } from '../../domain/repositories/order.repository.interface';

export interface GetOrderStatsRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetOrderStatsResponse {
  stats: OrderStats;
}

@Injectable()
export class GetOrderStatsUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: GetOrderStatsRequest): Promise<GetOrderStatsResponse> {
    const startDate = request.startDate ? new Date(request.startDate) : undefined;
    const endDate = request.endDate ? new Date(request.endDate) : undefined;

    const stats = await this.orderRepository.getStats(startDate, endDate);

    return { stats };
  }
} 