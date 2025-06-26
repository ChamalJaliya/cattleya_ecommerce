import { Module } from '@nestjs/common';
import { NotificationsInfrastructureModule } from './infrastructure/notifications.infrastructure.module';
import { NotificationsApplicationModule } from './application/notifications.application.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [NotificationsInfrastructureModule, NotificationsApplicationModule, SharedModule],
  exports: [NotificationsInfrastructureModule],
})
export class NotificationsModule {} 