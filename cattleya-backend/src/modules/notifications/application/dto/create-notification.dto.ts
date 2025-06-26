import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { NotificationType, NotificationPriority } from '../../domain/entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
} 