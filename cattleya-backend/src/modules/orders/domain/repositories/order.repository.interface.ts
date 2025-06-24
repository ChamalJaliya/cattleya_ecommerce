import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'number';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  pendingPaymentOrders: number;
}

export interface IOrderRepository {
  // Basic CRUD operations
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByNumber(number: string): Promise<Order | null>;
  findAll(options?: OrderQueryOptions): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }>;
  update(id: string, order: Order): Promise<Order>;
  delete(id: string): Promise<void>;

  // Order management
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order>;
  addTrackingNumber(id: string, trackingNumber: string): Promise<Order>;
  markAsShipped(id: string, trackingNumber?: string): Promise<Order>;
  markAsDelivered(id: string): Promise<Order>;
  markAsPaid(id: string): Promise<Order>;
  cancelOrder(id: string, reason?: string): Promise<Order>;

  // Customer orders
  findByUserId(userId: string, options?: OrderQueryOptions): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }>;

  // Analytics and stats
  getStats(startDate?: Date, endDate?: Date): Promise<OrderStats>;
  getRevenueStats(startDate?: Date, endDate?: Date): Promise<{ date: string; revenue: number; orders: number }[]>;

  // Utility methods
  generateOrderNumber(): Promise<string>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
} 