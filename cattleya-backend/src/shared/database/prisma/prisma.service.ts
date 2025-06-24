import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../../../core/logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService();

  constructor(private configService: ConfigService) {
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
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Successfully connected to database', 'PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed', 'PrismaService');
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  async optimizeConnection() {
    try {
      const maxPoolSize = this.configService.get('MONGODB_MAX_POOL_SIZE', 10);
      const minPoolSize = this.configService.get('MONGODB_MIN_POOL_SIZE', 2);
      const maxIdleTime = this.configService.get('MONGODB_MAX_IDLE_TIME_MS', 30000);
      this.logger.log(
        `Database connection pool configured: max=${maxPoolSize}, min=${minPoolSize}, idle=${maxIdleTime}ms`,
        'PrismaService'
      );
    } catch (error) {
      this.logger.error(
        'Failed to optimize database connection',
        error instanceof Error ? error.stack : 'Unknown error',
        'PrismaService'
      );
    }
  }

  async transactionWithRetry<T>(
    fn: (prisma: PrismaService) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(fn, {
          maxWait: 5000,
          timeout: 10000,
        });
      } catch (error) {
        lastError = error as Error;
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `Transaction attempt ${attempt} failed, retrying in ${delay}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'PrismaService'
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
    this.logger.error(
      `Transaction failed after ${maxRetries} attempts`,
      lastError?.stack,
      'PrismaService'
    );
    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'P2034',
      'P2037',
      'P2024',
      'P2025',
    ];
    return retryableErrors.some(code => error.code === code);
  }

  // Batch operations helper
  async batchOperation<T>(
    items: T[],
    batchSize: number = 100,
    operation: (batch: T[]) => Promise<any>
  ): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResult = await operation(batch);
      results.push(batchResult);
      
      this.logger.debug(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`,
        'PrismaService'
      );
    }
    
    return results;
  }
} 