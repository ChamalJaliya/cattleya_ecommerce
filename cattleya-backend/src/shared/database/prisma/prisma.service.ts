import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    console.log('🔍 PrismaService - DATABASE_URL:', databaseUrl ? 'Found' : 'NOT FOUND');
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Connected to MongoDB database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
} 