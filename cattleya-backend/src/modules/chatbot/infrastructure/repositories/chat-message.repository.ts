import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { ChatMessage, CreateChatMessageDto } from '../../domain/entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository {
  private readonly logger = new Logger(ChatMessageRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    try {
      const chatMessage = await this.prisma.chatMessage.create({
        data: {
          userId: createMessageDto.userId,
          message: createMessageDto.message,
          sender: createMessageDto.sender,
          metadata: createMessageDto.metadata || {},
          sessionId: createMessageDto.sessionId,
          isRead: false,
        },
      });

      this.logger.debug(`Created chat message: ${chatMessage.id} for user: ${chatMessage.userId}`);
      return chatMessage;
    } catch (error) {
      this.logger.error('Error creating chat message:', error);
      throw error;
    }
  }

  async findByUserId(userId: string, sessionId?: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const where: any = { userId };
      
      if (sessionId) {
        where.sessionId = sessionId;
      }

      const chatMessages = await this.prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Reverse to get chronological order (oldest first)
      return chatMessages.reverse();
    } catch (error) {
      this.logger.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async findBySessionId(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const chatMessages = await this.prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Reverse to get chronological order (oldest first)
      return chatMessages.reverse();
    } catch (error) {
      this.logger.error('Error fetching chat messages by session:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.prisma.chatMessage.update({
        where: { id: messageId },
        data: { isRead: true },
      });

      this.logger.debug(`Marked chat message as read: ${messageId}`);
    } catch (error) {
      this.logger.error('Error marking chat message as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string, sessionId?: string): Promise<void> {
    try {
      const where: any = { 
        userId, 
        isRead: false 
      };
      
      if (sessionId) {
        where.sessionId = sessionId;
      }

      await this.prisma.chatMessage.updateMany({
        where,
        data: { isRead: true },
      });

      this.logger.debug(`Marked all chat messages as read for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error marking all chat messages as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string, sessionId?: string): Promise<number> {
    try {
      const where: any = { 
        userId, 
        isRead: false 
      };
      
      if (sessionId) {
        where.sessionId = sessionId;
      }

      const count = await this.prisma.chatMessage.count({ where });
      return count;
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  async deleteOldMessages(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.chatMessage.deleteMany({
        where: {
          userId,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.debug(`Deleted ${result.count} old chat messages for user: ${userId}`);
      return result.count;
    } catch (error) {
      this.logger.error('Error deleting old chat messages:', error);
      throw error;
    }
  }

  async getSessionStats(userId: string): Promise<{ sessionId: string; messageCount: number; lastMessageAt: Date }[]> {
    try {
      const sessions = await this.prisma.chatMessage.groupBy({
        by: ['sessionId'],
        where: { userId },
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
      });

      return sessions.map(session => ({
        sessionId: session.sessionId || 'default',
        messageCount: session._count.id,
        lastMessageAt: session._max.createdAt!,
      }));
    } catch (error) {
      this.logger.error('Error getting session stats:', error);
      throw error;
    }
  }
} 