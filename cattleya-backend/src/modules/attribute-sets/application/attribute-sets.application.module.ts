import { Module } from '@nestjs/common';
import { AttributeSetsInfrastructureModule } from '../infrastructure/attribute-sets.infrastructure.module';
import { CreateAttributeSetUseCase } from './use-cases/create-attribute-set.use-case';
import { UpdateAttributeSetUseCase } from './use-cases/update-attribute-set.use-case';
import { DeleteAttributeSetUseCase } from './use-cases/delete-attribute-set.use-case';
import { GetAttributeSetUseCase } from './use-cases/get-attribute-set.use-case';
import { ListAttributeSetsUseCase } from './use-cases/list-attribute-sets.use-case';
import { GetAttributeSetWithAttributesUseCase } from './use-cases/get-attribute-set-with-attributes.use-case';

@Module({
  imports: [AttributeSetsInfrastructureModule],
  providers: [
    CreateAttributeSetUseCase,
    UpdateAttributeSetUseCase,
    DeleteAttributeSetUseCase,
    GetAttributeSetUseCase,
    ListAttributeSetsUseCase,
    GetAttributeSetWithAttributesUseCase,
  ],
  exports: [
    CreateAttributeSetUseCase,
    UpdateAttributeSetUseCase,
    DeleteAttributeSetUseCase,
    GetAttributeSetUseCase,
    ListAttributeSetsUseCase,
    GetAttributeSetWithAttributesUseCase,
  ],
})
export class AttributeSetsApplicationModule {} 