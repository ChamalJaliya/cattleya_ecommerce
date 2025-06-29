import { Injectable } from '@nestjs/common';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';
import { AttributeSet } from '../../domain/entities/attribute-set.entity';

@Injectable()
export class GetAttributeSetUseCase {
  constructor(
    private readonly attributeSetsRepository: IAttributeSetsRepository,
  ) {}

  async execute(id: string): Promise<AttributeSet | null> {
    return this.attributeSetsRepository.findById(id);
  }
} 