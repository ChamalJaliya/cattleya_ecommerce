import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IAttributesRepository } from '../../domain/repositories/attributes.repository';

@Injectable()
export class AttributesRepository implements IAttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number, search?: string, filterType?: string, advancedFilters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any[]> {
    let where: any = {};
    
    if (filterType && filterType !== 'all') {
      where.type = filterType;
    }

    // Advanced filters
    if (advancedFilters) {
      if (advancedFilters.isRequired) where.isRequired = true;
      if (advancedFilters.isFilterable) where.isFilterable = true;
      if (advancedFilters.isSearchable) where.isSearchable = true;
      if (advancedFilters.isComparable) where.isComparable = true;
      if (advancedFilters.isVisible) where.isVisible = true;
      if (advancedFilters.isVariantDefining) where.isVariantDefining = true;
      if (advancedFilters.isVariantOverridable) where.isVariantOverridable = true;
      if (advancedFilters.hasOptions) where.options = { not: [] };
    }

    // Fetch all attributes first if search is needed
    let attributes = await this.prisma.attribute.findMany({
      where,
      include: {
        attributeSet: true,
      },
    });

    // Apply search filter in memory if needed
    if (search) {
      const searchLower = search.toLowerCase();
      attributes = attributes.filter(attr => 
        attr.name.toLowerCase().includes(searchLower) ||
        attr.code.toLowerCase().includes(searchLower) ||
        attr.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sortField = sortBy || 'name';
    const sortDirection = sortOrder || 'asc';
    
    attributes.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    if (skip !== undefined && take !== undefined) {
      attributes = attributes.slice(skip, skip + take);
    }

    return attributes;
  }

  async findAndCountAll(skip = 0, take = 12, search?: string, filterType?: string, advancedFilters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ data: any[]; total: number }> {
    let where: any = {};
    
    if (filterType && filterType !== 'all') {
      where.type = filterType;
    }

    // Advanced filters
    if (advancedFilters) {
      if (advancedFilters.isRequired) where.isRequired = true;
      if (advancedFilters.isFilterable) where.isFilterable = true;
      if (advancedFilters.isSearchable) where.isSearchable = true;
      if (advancedFilters.isComparable) where.isComparable = true;
      if (advancedFilters.isVisible) where.isVisible = true;
      if (advancedFilters.isVariantDefining) where.isVariantDefining = true;
      if (advancedFilters.isVariantOverridable) where.isVariantOverridable = true;
      if (advancedFilters.hasOptions) where.options = { not: [] };
    }

    // Fetch all attributes first
    let attributes = await this.prisma.attribute.findMany({
      where,
      include: { attributeSet: true },
    });

    // Apply search filter in memory if needed
    if (search) {
      const searchLower = search.toLowerCase();
      attributes = attributes.filter(attr => 
        attr.name.toLowerCase().includes(searchLower) ||
        attr.code.toLowerCase().includes(searchLower) ||
        attr.type.toLowerCase().includes(searchLower)
      );
    }

    const total = attributes.length;

    // Apply sorting
    const sortField = sortBy || 'name';
    const sortDirection = sortOrder || 'asc';
    
    attributes.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const data = attributes.slice(skip, skip + take);
    
    return { data, total };
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
    // Ensure options is properly formatted as JSON if provided
    if (data.options && Array.isArray(data.options)) {
      data.options = data.options.map((option: any) => {
        if (typeof option === 'string') {
          return { value: option.toLowerCase(), label: option, isDefault: false };
        }
        // Ensure all required fields are present
        return {
          value: option.value || option.label?.toLowerCase() || '',
          label: option.label || option.value || '',
          isDefault: option.isDefault || false
        };
      });
    }

    return this.prisma.attribute.create({
      data,
      include: {
        attributeSet: true,
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    // Ensure options is properly formatted as JSON if provided
    if (data.options && Array.isArray(data.options)) {
      data.options = data.options.map((option: any) => {
        if (typeof option === 'string') {
          return { value: option.toLowerCase(), label: option, isDefault: false };
        }
        // Ensure all required fields are present
        return {
          value: option.value || option.label?.toLowerCase() || '',
          label: option.label || option.value || '',
          isDefault: option.isDefault || false
        };
      });
    }

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