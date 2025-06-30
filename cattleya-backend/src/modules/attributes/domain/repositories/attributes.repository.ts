export const ATTRIBUTES_REPOSITORY = 'ATTRIBUTES_REPOSITORY';

export interface IAttributesRepository {
  findAll(skip?: number, take?: number, search?: string, filterType?: string): Promise<any[]>;
  findAndCountAll(
    skip?: number,
    take?: number,
    search?: string,
    filterType?: string,
    advancedFilters?: any,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<{ data: any[]; total: number }>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
} 