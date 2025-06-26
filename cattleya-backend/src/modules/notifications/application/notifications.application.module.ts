import { Module } from '@nestjs/common';
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from './use-cases/get-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from './use-cases/mark-all-notifications-as-read.use-case';
import { GetNotificationStatsUseCase } from './use-cases/get-notification-stats.use-case';
import { GetUnreadCountUseCase } from './use-cases/get-unread-count.use-case';
import { NotificationService } from './services/notification.service';
import { NotificationMapper } from './mappers/notification.mapper';
import { RepositoriesModule } from '../infrastructure/repositories.module';

@Module({
  imports: [
    RepositoriesModule,
  ],
  providers: [
    CreateNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    GetNotificationStatsUseCase,
    GetUnreadCountUseCase,
    NotificationService,
    NotificationMapper,
  ],
  exports: [
    CreateNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    GetNotificationStatsUseCase,
    GetUnreadCountUseCase,
    NotificationService,
    NotificationMapper,
  ],
})
export class NotificationsApplicationModule {} 