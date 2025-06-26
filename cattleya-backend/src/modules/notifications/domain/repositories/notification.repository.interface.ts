import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  isArchived?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface INotificationRepository {
  // CRUD operations
  create(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  update(id: string, notification: Notification): Promise<Notification>;
  delete(id: string): Promise<void>;

  // Query operations
  findByUserId(userId: string, options?: NotificationQueryOptions): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // Status operations
  markAsRead(id: string): Promise<Notification>;
  markAsUnread(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  archive(id: string): Promise<Notification>;
  unarchive(id: string): Promise<Notification>;

  // Stats and analytics
  getStats(userId: string): Promise<NotificationStats>;
  getUnreadCount(userId: string): Promise<number>;

  // Bulk operations
  createMany(notifications: Notification[]): Promise<Notification[]>;
  deleteExpired(): Promise<number>;
  deleteByUserId(userId: string): Promise<number>;

  // Admin operations
  findAll(options?: NotificationQueryOptions): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
} 