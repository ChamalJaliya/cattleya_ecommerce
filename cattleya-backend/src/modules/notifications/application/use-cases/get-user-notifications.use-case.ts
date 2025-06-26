import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository, NotificationQueryOptions } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string, options: NotificationQueryOptions = {}): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificationRepository.findByUserId(userId, options);
  }
} 