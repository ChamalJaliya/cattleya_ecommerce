import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma/prisma.service';
import { S3Service } from './s3/s3.service';
import { StripeModule } from './stripe/stripe.module';
import { RedisCacheModule } from './cache/cache.module';
import { BrevoModule } from './email/brevo.module';

@Global()
@Module({
  imports: [StripeModule, RedisCacheModule, BrevoModule],
  providers: [PrismaService, S3Service],
  exports: [PrismaService, S3Service, StripeModule, RedisCacheModule, BrevoModule],
})
export class SharedModule {} 