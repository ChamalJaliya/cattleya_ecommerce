import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IAttributesRepository } from '../../domain/repositories/attributes.repository';

@Injectable()
export class AttributesRepository implements IAttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return this.prisma.attribute.findMany({
      include: {
        attributeSet: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.attribute.findUnique({
      where: { id },
      include: {
        attributeSet: true,
      },
    });
  }

  async create(data: any): Promise<any> {
    return this.prisma.attribute.create({
      data,
      include: {
        attributeSet: true,
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.attribute.update({
      where: { id },
      data,
      include: {
        attributeSet: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attribute.delete({
      where: { id },
    });
  }
} 