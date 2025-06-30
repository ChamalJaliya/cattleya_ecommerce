import { AttributeType } from '@prisma/client';

export class Attribute {
  id: string;
  attributeSetId: string;
  name: string;
  code: string;
  type: AttributeType;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  sortOrder: number;
  options: string[];
  minValue?: number;
  maxValue?: number;
  unit?: string;
  maxLength?: number;
  pattern?: string;
  allowCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AttributeSet {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  attributes: Attribute[];
  createdAt: Date;
  updatedAt: Date;
} 