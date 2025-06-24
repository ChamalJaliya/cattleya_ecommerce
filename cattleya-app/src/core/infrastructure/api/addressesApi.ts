import { BaseApiService, ApiResponse } from './base-api.service';

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  type: 'shipping' | 'billing';
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface UpdateAddressDto {
  type?: 'shipping' | 'billing';
  label?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export class AddressesApiService extends BaseApiService {
  private readonly endpoint = '/addresses';

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return this.get<ApiResponse<Address[]>>(this.endpoint);
  }

  async createAddress(addressData: CreateAddressDto): Promise<ApiResponse<Address>> {
    return this.post<ApiResponse<Address>>(this.endpoint, addressData);
  }

  async updateAddress(id: string, addressData: UpdateAddressDto): Promise<ApiResponse<Address>> {
    return this.put<ApiResponse<Address>>(`${this.endpoint}/${id}`, addressData);
  }

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.endpoint}/${id}/default`);
  }
}

// Export singleton instance
export const addressesApi = new AddressesApiService(); 