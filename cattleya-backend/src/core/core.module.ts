import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';

import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggerService } from './logger/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class CoreModule {} 