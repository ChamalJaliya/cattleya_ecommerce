import { apiClient } from './apiClient';
import { Notification, NotificationStats } from '@/core/application/stores/useNotificationStore';

export interface CreateNotificationDto {
  type: string;
  title: string;
  message: string;
  priority?: string;
  metadata?: any;
  expiresAt?: string;
}

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  type?: string;
  priority?: string;
  isRead?: boolean;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class NotificationsApi {
  private baseUrl = '/notifications';

  async getNotifications(options: NotificationQueryOptions = {}): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.type) params.append('type', options.type);
    if (options.priority) params.append('priority', options.priority);
    if (options.isRead !== undefined) params.append('isRead', options.isRead.toString());
    if (options.isArchived !== undefined) params.append('isArchived', options.isArchived.toString());
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data || response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/unread-count`);
    return response.data.data || response.data;
  }

  async getStats(): Promise<NotificationStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data.data || response.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/read`);
    return response.data.data || response.data;
  }

  async markAllAsRead(): Promise<{ message: string }> {
    const response = await apiClient.put(`${this.baseUrl}/mark-all-read`);
    return response.data.data || response.data;
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data.data || response.data;
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async archiveNotification(id: string): Promise<Notification> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/archive`);
    return response.data.data || response.data;
  }

  async unarchiveNotification(id: string): Promise<Notification> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/unarchive`);
    return response.data.data || response.data;
  }
}

export const notificationsApi = new NotificationsApi(); 