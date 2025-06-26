import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository, NotificationStats } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class GetNotificationStatsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<NotificationStats> {
    return this.notificationRepository.getStats(userId);
  }
} 