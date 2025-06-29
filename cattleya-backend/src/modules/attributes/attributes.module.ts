import { Module } from '@nestjs/common';
import { AttributesInfrastructureModule } from './infrastructure/attributes.infrastructure.module';
import { AttributesApplicationModule } from './application/attributes.application.module';
import { AttributesController } from './infrastructure/controllers/attributes.controller';

@Module({
  imports: [AttributesInfrastructureModule, AttributesApplicationModule],
  controllers: [AttributesController],
  exports: [AttributesInfrastructureModule, AttributesApplicationModule],
})
export class AttributesModule {} 