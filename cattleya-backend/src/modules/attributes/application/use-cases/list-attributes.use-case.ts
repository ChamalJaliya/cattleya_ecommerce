import { Inject, Injectable } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, IAttributesRepository } from '../../domain/repositories/attributes.repository';

@Injectable()
export class ListAttributesUseCase {
  constructor(
    @Inject(ATTRIBUTES_REPOSITORY)
    private readonly attributesRepository: IAttributesRepository,
  ) {}

  async execute(page = 1, limit = 12, search?: string, filterType?: string, advancedFilters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const skip = (page - 1) * limit;
    return this.attributesRepository.findAndCountAll(skip, limit, search, filterType, advancedFilters, sortBy, sortOrder);
  }
} 