import { Injectable } from '@nestjs/common';
import { CreateNotificationUseCase } from '../use-cases/create-notification.use-case';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly createNotificationUseCase: CreateNotificationUseCase) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    return this.createNotificationUseCase.execute(dto);
  }

  async createOrderConfirmation(userId: string, orderNumber: string, orderId: string): Promise<Notification> {
    const notification = Notification.createOrderConfirmation(userId, orderNumber, orderId);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createOrderStatusUpdate(userId: string, orderNumber: string, orderId: string, status: string): Promise<Notification> {
    const notification = Notification.createOrderStatusUpdate(userId, orderNumber, orderId, status);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createOrderShipped(userId: string, orderNumber: string, orderId: string, trackingNumber?: string): Promise<Notification> {
    const notification = Notification.createOrderShipped(userId, orderNumber, orderId, trackingNumber);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createOrderDelivered(userId: string, orderNumber: string, orderId: string): Promise<Notification> {
    const notification = Notification.createOrderDelivered(userId, orderNumber, orderId);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createPaymentSuccess(userId: string, orderNumber: string, orderId: string, amount: number): Promise<Notification> {
    const notification = Notification.createPaymentSuccess(userId, orderNumber, orderId, amount);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createPaymentFailed(userId: string, orderNumber: string, orderId: string, amount: number): Promise<Notification> {
    const notification = Notification.createPaymentFailed(userId, orderNumber, orderId, amount);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createLowStock(userId: string, productName: string, productId: string): Promise<Notification> {
    const notification = Notification.createLowStock(userId, productName, productId);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createPromotion(userId: string, title: string, message: string, promotionId: string): Promise<Notification> {
    const notification = Notification.createPromotion(userId, title, message, promotionId);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createSystemAlert(userId: string, title: string, message: string): Promise<Notification> {
    const notification = Notification.createSystemAlert(userId, title, message);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createSupportReply(userId: string, ticketId: string, ticketNumber: string): Promise<Notification> {
    const notification = Notification.createSupportReply(userId, ticketId, ticketNumber);
    return this.createNotificationUseCase.execute({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt?.toISOString(),
    });
  }

  async createCustomNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority?: string,
    metadata?: Record<string, any>,
    expiresAt?: string,
  ): Promise<Notification> {
    return this.createNotificationUseCase.execute({
      userId,
      type,
      title,
      message,
      priority: priority as any,
      metadata,
      expiresAt,
    });
  }
} 