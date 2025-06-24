import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: 60 * 60 * 24, // 24 hours default TTL
        max: 100, // Maximum number of items in cache
        isGlobal: true,
        // Use in-memory store for development, Redis for production
        store: process.env.NODE_ENV === 'production' ? 'redis' : 'memory',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class RedisCacheModule {} 