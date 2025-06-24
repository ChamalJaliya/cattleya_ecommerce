import { Injectable, Inject } from '@nestjs/common';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';
import { Address } from '../../domain/entities/address.entity';
import { CreateAddressDto } from '../dto/create-address.dto';

export interface CreateAddressRequest {
  userId: string;
  addressData: CreateAddressDto;
}

export interface CreateAddressResponse {
  address: Address;
}

@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository
  ) {}

  async execute(request: CreateAddressRequest): Promise<CreateAddressResponse> {
    const { userId, addressData } = request;

    // If this address is set as default, unset other addresses of the same type
    if (addressData.isDefault) {
      await this.addressRepository.setDefault('', userId, addressData.type);
    }

    const address = await this.addressRepository.create({
      userId,
      ...addressData,
    });

    return { address };
  }
} 