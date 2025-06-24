import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';
import { Address } from '../../domain/entities/address.entity';
import { UpdateAddressDto } from '../dto/update-address.dto';

export interface UpdateAddressRequest {
  id: string;
  userId: string;
  addressData: UpdateAddressDto;
}

export interface UpdateAddressResponse {
  address: Address;
}

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository
  ) {}

  async execute(request: UpdateAddressRequest): Promise<UpdateAddressResponse> {
    const { id, userId, addressData } = request;

    // Check if address exists and belongs to user
    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    // If this address is set as default, unset other addresses of the same type
    if (addressData.isDefault) {
      await this.addressRepository.setDefault(id, userId, existingAddress.type);
    }

    const address = await this.addressRepository.update(id, addressData);
    return { address };
  }
} 