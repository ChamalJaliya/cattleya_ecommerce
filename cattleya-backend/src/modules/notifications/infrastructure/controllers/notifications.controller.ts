import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateNotificationDto } from '../../application/dto/create-notification.dto';
import { NotificationResponseDto, NotificationListResponseDto, NotificationStatsResponseDto } from '../../application/dto/notification-response.dto';
import { NotificationMapper } from '../../application/mappers/notification.mapper';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from '../../application/use-cases/get-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../../application/use-cases/mark-all-notifications-as-read.use-case';
import { GetNotificationStatsUseCase } from '../../application/use-cases/get-notification-stats.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { NotificationType, NotificationPriority } from '../../domain/entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly getNotificationStatsUseCase: GetNotificationStatsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', type: NotificationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.createNotificationUseCase.execute(createNotificationDto);
    return NotificationMapper.toResponseDto(notification);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully', type: NotificationListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean })
  async getUserNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('priority') priority?: NotificationPriority,
    @Query('isRead') isRead?: boolean,
    @Query('isArchived') isArchived?: boolean,
  ): Promise<NotificationListResponseDto> {
    const userId = req.user.id;
    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      type,
      priority,
      isRead: isRead !== undefined ? Boolean(isRead) : undefined,
      isArchived: isArchived !== undefined ? Boolean(isArchived) : undefined,
    };

    const result = await this.getUserNotificationsUseCase.execute(userId, options);
    return NotificationMapper.toListResponseDto(
      result.notifications,
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: NotificationStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotificationStats(@Request() req): Promise<NotificationStatsResponseDto> {
    const userId = req.user.id;
    const stats = await this.getNotificationStatsUseCase.execute(userId);
    return NotificationMapper.toStatsResponseDto(stats);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully', type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const userId = req.user.id;
    const count = await this.getUnreadCountUseCase.execute(userId);
    return { count };
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.markNotificationAsReadUseCase.execute(id);
    return NotificationMapper.toResponseDto(notification);
  }

  @Put('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@Request() req): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.markAllNotificationsAsReadUseCase.execute(userId);
    return { message: 'All notifications marked as read' };
  }
} 