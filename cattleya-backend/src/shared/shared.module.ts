import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma/prisma.service';
import { S3Service } from './s3/s3.service';
import { StripeModule } from './stripe/stripe.module';

@Global()
@Module({
  imports: [StripeModule],
  providers: [PrismaService, S3Service],
  exports: [PrismaService, S3Service, StripeModule],
})
export class SharedModule {} 