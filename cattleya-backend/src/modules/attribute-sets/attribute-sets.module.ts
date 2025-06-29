import { Module } from '@nestjs/common';
import { AttributeSetsInfrastructureModule } from './infrastructure/attribute-sets.infrastructure.module';
import { AttributeSetsApplicationModule } from './application/attribute-sets.application.module';
import { AttributeSetsController } from './infrastructure/controllers/attribute-sets.controller';

@Module({
  imports: [AttributeSetsInfrastructureModule, AttributeSetsApplicationModule],
  controllers: [AttributeSetsController],
  exports: [
    AttributeSetsInfrastructureModule,
    AttributeSetsApplicationModule,
  ],
})
export class AttributeSetsModule {} 