import { Address } from '../entities/address.entity';

export interface AddressRepository {
  findByUserId(userId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  create(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address>;
  update(id: string, address: Partial<Address>): Promise<Address>;
  delete(id: string): Promise<void>;
  setDefault(id: string, userId: string, type: 'shipping' | 'billing'): Promise<void>;
} 