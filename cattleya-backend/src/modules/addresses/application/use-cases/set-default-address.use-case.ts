import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';

export interface SetDefaultAddressRequest {
  id: string;
  userId: string;
}

@Injectable()
export class SetDefaultAddressUseCase {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository
  ) {}

  async execute(request: SetDefaultAddressRequest): Promise<void> {
    const { id, userId } = request;

    // Check if address exists and belongs to user
    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.setDefault(id, userId, existingAddress.type);
  }
} 