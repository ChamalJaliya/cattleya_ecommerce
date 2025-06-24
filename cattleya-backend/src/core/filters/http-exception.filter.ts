import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message || message,
    };

    // Handle 401 errors more gracefully - they're often expected
    if (status === HttpStatus.UNAUTHORIZED) {
      // Log as warning instead of error for expected auth failures
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - "Unauthorized"`,
        'HttpExceptionFilter'
      );
    } else {
      // Log other errors as errors
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse.message)}`,
        exception instanceof Error ? exception.stack : undefined,
        'HttpExceptionFilter'
      );
    }

    response.status(status).json(errorResponse);
  }
} 