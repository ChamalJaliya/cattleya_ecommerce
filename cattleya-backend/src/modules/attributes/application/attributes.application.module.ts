import { Module } from '@nestjs/common';
import { AttributesInfrastructureModule } from '../infrastructure/attributes.infrastructure.module';
import { CreateAttributeUseCase } from './use-cases/create-attribute.use-case';
import { UpdateAttributeUseCase } from './use-cases/update-attribute.use-case';
import { DeleteAttributeUseCase } from './use-cases/delete-attribute.use-case';
import { GetAttributeUseCase } from './use-cases/get-attribute.use-case';
import { ListAttributesUseCase } from './use-cases/list-attributes.use-case';

@Module({
  imports: [AttributesInfrastructureModule],
  providers: [
    CreateAttributeUseCase,
    UpdateAttributeUseCase,
    DeleteAttributeUseCase,
    GetAttributeUseCase,
    ListAttributesUseCase,
  ],
  exports: [
    CreateAttributeUseCase,
    UpdateAttributeUseCase,
    DeleteAttributeUseCase,
    GetAttributeUseCase,
    ListAttributesUseCase,
  ],
})
export class AttributesApplicationModule {} 