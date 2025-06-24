import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma/prisma.service';
import { S3Service } from './s3/s3.service';
import { StripeModule } from './stripe/stripe.module';
import { RedisCacheModule } from './cache/cache.module';

@Global()
@Module({
  imports: [StripeModule, RedisCacheModule],
  providers: [PrismaService, S3Service],
  exports: [PrismaService, S3Service, StripeModule, RedisCacheModule],
})
export class SharedModule {} 