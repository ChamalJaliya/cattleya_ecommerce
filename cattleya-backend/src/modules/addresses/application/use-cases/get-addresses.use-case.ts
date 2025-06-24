import { Injectable, Inject } from '@nestjs/common';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';
import { Address } from '../../domain/entities/address.entity';

export interface GetAddressesRequest {
  userId: string;
}

export interface GetAddressesResponse {
  addresses: Address[];
}

@Injectable()
export class GetAddressesUseCase {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository
  ) {}

  async execute(request: GetAddressesRequest): Promise<GetAddressesResponse> {
    const addresses = await this.addressRepository.findByUserId(request.userId);
    return { addresses };
  }
} 