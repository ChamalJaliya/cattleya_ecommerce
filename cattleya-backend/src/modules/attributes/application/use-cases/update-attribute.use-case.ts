import { Inject, Injectable } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, IAttributesRepository } from '../../domain/repositories/attributes.repository';

@Injectable()
export class UpdateAttributeUseCase {
  constructor(
    @Inject(ATTRIBUTES_REPOSITORY)
    private readonly attributesRepository: IAttributesRepository,
  ) {}

  async execute(id: string, data: any) {
    return this.attributesRepository.update(id, data);
  }
} 