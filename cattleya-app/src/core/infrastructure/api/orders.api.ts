import { BaseApiService, ApiResponse, PaginatedResponse } from './base-api.service';

export interface OrdersQuery {
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

export interface UpdateOrderRequest {
  status?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
  notes?: string;
  customerNotes?: string;
}

export class OrdersApiService extends BaseApiService {
  private readonly endpoint = '/orders';

  async getOrders(query: OrdersQuery = {}): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    return this.get<PaginatedResponse<any>>(url);
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(`${this.endpoint}/${id}`);
  }

  async updateOrder(id: string, data: UpdateOrderRequest): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`${this.endpoint}/${id}`, data);
  }

  async printOrder(id: string): Promise<string> {
    // Returns HTML string
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/print`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch printable order');
    return response.text();
  }

  async getOrderStats(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<any>> {
    const urlParams = new URLSearchParams();
    if (params.startDate) urlParams.append('startDate', params.startDate);
    if (params.endDate) urlParams.append('endDate', params.endDate);
    const url = urlParams.toString() ? `${this.endpoint}/stats?${urlParams}` : `${this.endpoint}/stats`;
    return this.get<ApiResponse<any>>(url);
  }
}

export const ordersApi = new OrdersApiService(); 