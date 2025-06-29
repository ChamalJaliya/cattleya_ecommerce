import { AttributeSet } from '../entities/attribute-set.entity';
import { CreateAttributeSetDto } from '../../application/dto/create-attribute-set.dto';
import { UpdateAttributeSetDto } from '../../application/dto/update-attribute-set.dto';

export abstract class IAttributeSetsRepository {}

export interface IAttributeSetsRepository {
  create(data: CreateAttributeSetDto): Promise<AttributeSet>;
  update(id: string, data: UpdateAttributeSetDto): Promise<AttributeSet>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AttributeSet | null>;
  findByIdWithAttributes(id: string): Promise<AttributeSet | null>;
  findAll(): Promise<AttributeSet[]>;
  findActive(): Promise<AttributeSet[]>;
} 