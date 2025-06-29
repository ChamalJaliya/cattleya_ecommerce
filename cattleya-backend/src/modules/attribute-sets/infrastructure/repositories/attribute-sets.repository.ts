import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IAttributeSetsRepository } from '../../domain/repositories/attribute-sets.repository';
import { AttributeSet, Attribute } from '../../domain/entities/attribute-set.entity';
import { CreateAttributeSetDto } from '../../application/dto/create-attribute-set.dto';
import { UpdateAttributeSetDto } from '../../application/dto/update-attribute-set.dto';
import { AttributeType } from '@prisma/client';

@Injectable()
export class AttributeSetsRepository implements IAttributeSetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttributeSetDto): Promise<AttributeSet> {
    const { attributes, ...attributeSetData } = data;

    const attributeSet = await this.prisma.attributeSet.create({
      data: {
        ...attributeSetData,
        attributes: {
          create: attributes?.map((attr, index) => ({
            ...attr,
            type: attr.type as AttributeType,
            sortOrder: index,
          })) || [],
        },
      },
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToEntity(attributeSet);
  }

  async update(id: string, data: UpdateAttributeSetDto): Promise<AttributeSet> {
    const { attributes, ...attributeSetData } = data;

    // If attributes are provided, replace all existing attributes
    if (attributes) {
      // Delete existing attributes
      await this.prisma.attribute.deleteMany({
        where: { attributeSetId: id },
      });

      // Create new attributes
      await this.prisma.attribute.createMany({
        data: attributes.map((attr, index) => ({
          ...attr,
          attributeSetId: id,
          type: attr.type as AttributeType,
          sortOrder: index,
        })),
      });
    }

    const attributeSet = await this.prisma.attributeSet.update({
      where: { id },
      data: attributeSetData,
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToEntity(attributeSet);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attributeSet.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<AttributeSet | null> {
    const attributeSet = await this.prisma.attributeSet.findUnique({
      where: { id },
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return attributeSet ? this.mapToEntity(attributeSet) : null;
  }

  async findByIdWithAttributes(id: string): Promise<AttributeSet | null> {
    return this.findById(id);
  }

  async findAll(): Promise<AttributeSet[]> {
    const attributeSets = await this.prisma.attributeSet.findMany({
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return attributeSets.map(set => this.mapToEntity(set));
  }

  async findActive(): Promise<AttributeSet[]> {
    const attributeSets = await this.prisma.attributeSet.findMany({
      where: { isActive: true },
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return attributeSets.map(set => this.mapToEntity(set));
  }

  private mapToEntity(data: any): AttributeSet {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      attributes: data.attributes?.map((attr: any) => ({
        id: attr.id,
        attributeSetId: attr.attributeSetId,
        name: attr.name,
        type: attr.type,
        isRequired: attr.isRequired,
        isSearchable: attr.isSearchable,
        isFilterable: attr.isFilterable,
        sortOrder: attr.sortOrder,
        options: attr.options,
        minValue: attr.minValue,
        maxValue: attr.maxValue,
        unit: attr.unit,
        maxLength: attr.maxLength,
        pattern: attr.pattern,
        allowCustom: attr.allowCustom,
        createdAt: attr.createdAt,
        updatedAt: attr.updatedAt,
      })) || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
} 