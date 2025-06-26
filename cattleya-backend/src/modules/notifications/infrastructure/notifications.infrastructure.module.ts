import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsApplicationModule } from '../application/notifications.application.module';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationRepository } from './repositories/notification.repository';

@Module({
  imports: [
    NotificationsApplicationModule,
    SharedModule
  ],
  controllers: [NotificationsController],
  providers: [
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [
    'INotificationRepository',
  ],
})
export class NotificationsInfrastructureModule {} 