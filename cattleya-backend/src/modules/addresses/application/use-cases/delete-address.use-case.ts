import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';

export interface DeleteAddressRequest {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository
  ) {}

  async execute(request: DeleteAddressRequest): Promise<void> {
    const { id, userId } = request;

    // Check if address exists and belongs to user
    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.delete(id);
  }
} 