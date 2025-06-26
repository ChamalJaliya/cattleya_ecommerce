import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { INotificationRepository, NotificationQueryOptions, NotificationStats } from '../../domain/repositories/notification.repository.interface';
import { Notification, NotificationType, NotificationPriority } from '../../domain/entities/notification.entity';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: Notification): Promise<Notification> {
    const created = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type as $Enums.NotificationType,
        title: notification.title,
        message: notification.message,
        priority: notification.priority as $Enums.NotificationPriority,
        isRead: notification.isRead,
        isArchived: notification.isArchived,
        metadata: notification.metadata,
        expiresAt: notification.expiresAt,
      },
    });
    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.mapToEntity(notification) : null;
  }

  async update(id: string, notification: Notification): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        type: notification.type as $Enums.NotificationType,
        title: notification.title,
        message: notification.message,
        priority: notification.priority as $Enums.NotificationPriority,
        isRead: notification.isRead,
        isArchived: notification.isArchived,
        metadata: notification.metadata,
        expiresAt: notification.expiresAt,
        updatedAt: new Date(),
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string, options: NotificationQueryOptions = {}): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      isRead,
      isArchived,
      startDate,
      endDate,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (type) where.type = type as $Enums.NotificationType;
    if (priority) where.priority = priority as $Enums.NotificationPriority;
    if (isRead !== undefined) where.isRead = isRead;
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    // Get total count
    const total = await this.prisma.notification.count({ where });
    // Get notifications
    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const totalPages = Math.ceil(total / limit);
    return {
      notifications: notifications.map(notification => this.mapToEntity(notification)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async markAsRead(id: string): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, updatedAt: new Date() },
    });
    return this.mapToEntity(updated);
  }

  async markAsUnread(id: string): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: false, updatedAt: new Date() },
    });
    return this.mapToEntity(updated);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, updatedAt: new Date() },
    });
  }

  async archive(id: string): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isArchived: true, updatedAt: new Date() },
    });
    return this.mapToEntity(updated);
  }

  async unarchive(id: string): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isArchived: false, updatedAt: new Date() },
    });
    return this.mapToEntity(updated);
  }

  async getStats(userId: string): Promise<NotificationStats> {
    const [
      total,
      unread,
      read,
      archived,
      byType,
      byPriority,
    ] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.prisma.notification.count({ where: { userId, isRead: true } }),
      this.prisma.notification.count({ where: { userId, isArchived: true } }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
      this.prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true },
      }),
    ]);
    const byTypeRecord: Record<NotificationType, number> = {
      [NotificationType.ORDER_CONFIRMATION]: 0,
      [NotificationType.ORDER_STATUS_UPDATE]: 0,
      [NotificationType.ORDER_SHIPPED]: 0,
      [NotificationType.ORDER_DELIVERED]: 0,
      [NotificationType.PAYMENT_SUCCESS]: 0,
      [NotificationType.PAYMENT_FAILED]: 0,
      [NotificationType.LOW_STOCK]: 0,
      [NotificationType.PROMOTION]: 0,
      [NotificationType.SYSTEM_ALERT]: 0,
      [NotificationType.SUPPORT_REPLY]: 0,
    };
    const byPriorityRecord: Record<NotificationPriority, number> = {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.MEDIUM]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.URGENT]: 0,
    };
    byType.forEach(item => {
      byTypeRecord[item.type as NotificationType] = item._count.type;
    });
    byPriority.forEach(item => {
      byPriorityRecord[item.priority as NotificationPriority] = item._count.priority;
    });
    return {
      total,
      unread,
      read,
      archived,
      byType: byTypeRecord,
      byPriority: byPriorityRecord,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async createMany(notifications: Notification[]): Promise<Notification[]> {
    const data = notifications.map(notification => ({
      userId: notification.userId,
      type: notification.type as $Enums.NotificationType,
      title: notification.title,
      message: notification.message,
      priority: notification.priority as $Enums.NotificationPriority,
      isRead: notification.isRead,
      isArchived: notification.isArchived,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt,
    }));
    await this.prisma.notification.createMany({ data });
    // Note: createMany doesn't return the created records, so we'll need to fetch them
    // This is a limitation of Prisma's createMany
    return notifications; // For now, return the original notifications
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  async findAll(options: NotificationQueryOptions = {}): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      isRead,
      isArchived,
      startDate,
      endDate,
    } = options;
    const skip = (page - 1) * limit;
    // Build where clause
    const where: any = {};
    if (type) where.type = type as $Enums.NotificationType;
    if (priority) where.priority = priority as $Enums.NotificationPriority;
    if (isRead !== undefined) where.isRead = isRead;
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    // Get total count
    const total = await this.prisma.notification.count({ where });
    // Get notifications
    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    const totalPages = Math.ceil(total / limit);
    return {
      notifications: notifications.map(notification => this.mapToEntity(notification)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private mapToEntity(data: any): Notification {
    return new Notification({
      id: data.id,
      userId: data.userId,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      priority: data.priority as NotificationPriority,
      isRead: data.isRead,
      isArchived: data.isArchived,
      metadata: data.metadata,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
} 