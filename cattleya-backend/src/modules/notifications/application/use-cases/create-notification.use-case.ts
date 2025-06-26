import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<Notification> {
    const notification = Notification.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      priority: dto.priority || 'MEDIUM' as any,
      metadata: dto.metadata,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return this.notificationRepository.create(notification);
  }
} 