import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    const csp = this.buildCSP();
    res.setHeader('Content-Security-Policy', csp);

    // HSTS (only in production)
    if (this.configService.get('NODE_ENV') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Rate limiting headers
    this.setRateLimitHeaders(req, res);

    // Request logging for security monitoring
    this.logSecurityEvent(req);

    next();
  }

  private buildCSP(): string {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http: blob:",
      "connect-src 'self' https://api.stripe.com https://maps.googleapis.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];

    return baseCSP.join('; ');
  }

  private setRateLimitHeaders(req: Request, res: Response) {
    // These would be set by your rate limiting middleware
    const rateLimit = req.headers['x-ratelimit-limit'];
    const rateLimitRemaining = req.headers['x-ratelimit-remaining'];
    const rateLimitReset = req.headers['x-ratelimit-reset'];

    if (rateLimit) res.setHeader('X-RateLimit-Limit', rateLimit);
    if (rateLimitRemaining) res.setHeader('X-RateLimit-Remaining', rateLimitRemaining);
    if (rateLimitReset) res.setHeader('X-RateLimit-Reset', rateLimitReset);
  }

  private logSecurityEvent(req: Request) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      origin: req.headers['origin'],
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
    };

    // Log suspicious activities
    if (this.isSuspiciousRequest(req)) {
      console.warn('Suspicious request detected:', securityEvent);
    }

    // Log all requests in development
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log('Request:', securityEvent);
    }
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  private isSuspiciousRequest(req: Request): boolean {
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /eval\s*\(/i, // Code injection
      /document\.cookie/i, // Cookie theft attempts
    ];

    const url = req.url.toLowerCase();
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    return suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(userAgent)
    );
  }
}

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validate request size
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'Request body exceeds maximum allowed size',
      });
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      
      if (req.url.includes('/upload') || req.url.includes('/media')) {
        // Allow multipart for file uploads
        if (!contentType?.startsWith('multipart/form-data')) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid content type for file upload',
          });
        }
      } else {
        // Require JSON for API requests
        if (!contentType?.includes('application/json')) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Content-Type must be application/json',
          });
        }
      }
    }

    next();
  }
}

@Injectable()
export class ResponseSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function(data: any) {
      if (typeof data === 'string') {
        data = this.sanitizeString(data);
      } else if (typeof data === 'object') {
        data = this.sanitizeObject(data);
      }

      return originalSend.call(this, data);
    }.bind(this);

    next();
  }

  private sanitizeString(str: string): string {
    // Remove potential XSS vectors
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return obj;
  }
} 