import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto, NotificationListResponseDto, NotificationStatsResponseDto } from '../dto/notification-response.dto';
import { NotificationStats } from '../../domain/repositories/notification.repository.interface';

export class NotificationMapper {
  static toResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      isRead: notification.isRead,
      isArchived: notification.isArchived,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  static toResponseDtoList(notifications: Notification[]): NotificationResponseDto[] {
    return notifications.map(notification => this.toResponseDto(notification));
  }

  static toListResponseDto(
    notifications: Notification[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
  ): NotificationListResponseDto {
    return {
      notifications: this.toResponseDtoList(notifications),
      total,
      page,
      limit,
      totalPages,
    };
  }

  static toStatsResponseDto(stats: NotificationStats): NotificationStatsResponseDto {
    return {
      total: stats.total,
      unread: stats.unread,
      read: stats.read,
      archived: stats.archived,
      byType: stats.byType,
      byPriority: stats.byPriority,
    };
  }
} 