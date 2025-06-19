import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getStatus(): { message: string; timestamp: string; version: string } {
    return {
      message: '🌺 Cattleya E-commerce API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getHealth(): { status: string; uptime: number } {
    return {
      status: 'OK',
      uptime: Date.now() - this.startTime,
    };
  }
} 