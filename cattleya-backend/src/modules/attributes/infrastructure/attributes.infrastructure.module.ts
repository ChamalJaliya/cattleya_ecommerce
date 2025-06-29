import { Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma/prisma.service';
import { AttributesRepository } from './repositories/attributes.repository';
import { ATTRIBUTES_REPOSITORY } from '../domain/repositories/attributes.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: ATTRIBUTES_REPOSITORY,
      useClass: AttributesRepository,
    },
  ],
  exports: [ATTRIBUTES_REPOSITORY],
})
export class AttributesInfrastructureModule {} 