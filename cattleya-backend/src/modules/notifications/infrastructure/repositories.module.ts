import { Module } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { PrismaModule } from '../../../shared/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
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
export class RepositoriesModule {} 