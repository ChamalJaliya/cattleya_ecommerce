export const ATTRIBUTES_REPOSITORY = 'ATTRIBUTES_REPOSITORY';

export interface IAttributesRepository {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
} 