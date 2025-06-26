import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  MONGODB_MAX_POOL_SIZE: Joi.number().default(10),
  MONGODB_MIN_POOL_SIZE: Joi.number().default(2),
  MONGODB_MAX_IDLE_TIME_MS: Joi.number().default(30000),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  
  // AWS
  AWS_REGION: Joi.string().required(),
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_SECRET_ACCESS_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // Security
  PASSWORD_MIN_LENGTH: Joi.number().default(8),
  PASSWORD_REQUIRE_UPPERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_LOWERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_NUMBERS: Joi.boolean().default(true),
  PASSWORD_REQUIRE_SYMBOLS: Joi.boolean().default(true),
  
  // Cache
  REDIS_URL: Joi.string().optional(),
  REDIS_PASSWORD: Joi.string().optional(),
  CACHE_TTL_PRODUCTS: Joi.number().default(3600),
  CACHE_TTL_CATEGORIES: Joi.number().default(7200),
  CACHE_TTL_USER_SESSION: Joi.number().default(86400),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  LOG_FILE_PATH: Joi.string().optional(),
  
  // Monitoring
  ENABLE_METRICS: Joi.boolean().default(false),
  METRICS_PORT: Joi.number().default(9090),
  
  // Feature Flags
  ENABLE_REVIEWS: Joi.boolean().default(true),
  ENABLE_WISHLIST: Joi.boolean().default(true),
  ENABLE_PRODUCT_COMPARISON: Joi.boolean().default(true),
  ENABLE_LOYALTY_PROGRAM: Joi.boolean().default(true),
  ENABLE_EMAIL_NOTIFICATIONS: Joi.boolean().default(true),
  ENABLE_PUSH_NOTIFICATIONS: Joi.boolean().default(false),
  
  // Development
  DEBUG: Joi.boolean().default(false),
  ENABLE_SWAGGER: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('/api-docs'),
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  PAYMENT_CURRENCY: Joi.string().default('USD'),
  
  // Email (optional)
  SES_REGION: Joi.string().optional(),
  SES_ACCESS_KEY_ID: Joi.string().optional(),
  SES_SECRET_ACCESS_KEY: Joi.string().optional(),
  SES_FROM_EMAIL: Joi.string().email().optional(),
  
  // Notifications (optional)
  SLACK_WEBHOOK_URL: Joi.string().uri().optional(),
  DISCORD_WEBHOOK_URL: Joi.string().uri().optional(),
  
  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: Joi.string().optional(),
  FACEBOOK_PIXEL_ID: Joi.string().optional(),
  GOOGLE_TAG_MANAGER_ID: Joi.string().optional(),
  
  // Brevo (optional)
  BREVO_API_KEY: Joi.string().optional(),
  BREVO_FROM_EMAIL: Joi.string().email().optional(),
}); 