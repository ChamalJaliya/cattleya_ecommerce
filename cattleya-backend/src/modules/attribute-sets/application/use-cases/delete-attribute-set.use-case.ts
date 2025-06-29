import { Injectable } from '@nestjs/common';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';

@Injectable()
export class DeleteAttributeSetUseCase {
  constructor(
    private readonly attributeSetsRepository: IAttributeSetsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.attributeSetsRepository.delete(id);
  }
} 