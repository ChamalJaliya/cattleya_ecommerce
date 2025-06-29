import { Injectable } from '@nestjs/common';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';
import { UpdateAttributeSetDto } from '../dto/update-attribute-set.dto';
import { AttributeSet } from '../../domain/entities/attribute-set.entity';

@Injectable()
export class UpdateAttributeSetUseCase {
  constructor(
    private readonly attributeSetsRepository: IAttributeSetsRepository,
  ) {}

  async execute(id: string, data: UpdateAttributeSetDto): Promise<AttributeSet> {
    return this.attributeSetsRepository.update(id, data);
  }
} 