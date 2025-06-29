import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeSetDto } from './create-attribute-set.dto';

export class UpdateAttributeSetDto extends PartialType(CreateAttributeSetDto) {} 