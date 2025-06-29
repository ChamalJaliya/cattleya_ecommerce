import { Module } from '@nestjs/common';
import { AttributeSetsRepository } from './repositories/attribute-sets.repository';
import { IAttributeSetsRepository } from '../domain/repositories/attribute-sets.repository';

@Module({
  providers: [
    {
      provide: IAttributeSetsRepository,
      useClass: AttributeSetsRepository,
    },
  ],
  exports: [IAttributeSetsRepository],
})
export class AttributeSetsInfrastructureModule {} 