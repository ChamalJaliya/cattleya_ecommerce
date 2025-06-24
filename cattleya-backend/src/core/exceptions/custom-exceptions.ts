import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string, errors?: any[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `${resource} with ${field} '${value}' already exists`,
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor(action: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Insufficient permissions to ${action}`,
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        message,
        error: 'Business Logic Error',
      },
      statusCode,
    );
  }
}

export class ExternalServiceException extends HttpException {
  constructor(service: string, message: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: `External service error (${service}): ${message}`,
        error: 'Service Unavailable',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class RateLimitExceededException extends HttpException {
  constructor(limit: number, window: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Rate limit exceeded. Maximum ${limit} requests per ${window}`,
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
} 