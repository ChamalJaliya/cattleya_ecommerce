import { Injectable } from '@nestjs/common';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';
import { CreateAttributeSetDto } from '../dto/create-attribute-set.dto';
import { AttributeSet } from '../../domain/entities/attribute-set.entity';

@Injectable()
export class CreateAttributeSetUseCase {
  constructor(
    private readonly attributeSetsRepository: IAttributeSetsRepository,
  ) {}

  async execute(data: CreateAttributeSetDto): Promise<AttributeSet> {
    return this.attributeSetsRepository.create(data);
  }
} 