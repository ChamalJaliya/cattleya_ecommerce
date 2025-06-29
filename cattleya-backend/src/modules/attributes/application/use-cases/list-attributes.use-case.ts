import { Inject, Injectable } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, IAttributesRepository } from '../../domain/repositories/attributes.repository';

@Injectable()
export class ListAttributesUseCase {
  constructor(
    @Inject(ATTRIBUTES_REPOSITORY)
    private readonly attributesRepository: IAttributesRepository,
  ) {}

  async execute() {
    return this.attributesRepository.findAll();
  }
} 