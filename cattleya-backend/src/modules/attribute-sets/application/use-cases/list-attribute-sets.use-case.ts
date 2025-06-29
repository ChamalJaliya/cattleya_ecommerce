import { Injectable } from '@nestjs/common';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';
import { AttributeSet } from '../../domain/entities/attribute-set.entity';

@Injectable()
export class ListAttributeSetsUseCase {
  constructor(
    private readonly attributeSetsRepository: IAttributeSetsRepository,
  ) {}

  async execute(): Promise<AttributeSet[]> {
    return this.attributeSetsRepository.findAll();
  }
} 