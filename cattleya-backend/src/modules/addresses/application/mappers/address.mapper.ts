import { Address } from '../../domain/entities/address.entity';
import { AddressResponseDto } from '../dto/address-response.dto';

export class AddressMapper {
  static toResponseDto(address: Address): AddressResponseDto {
    return {
      id: address.id!,
      userId: address.userId,
      type: address.type,
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      createdAt: address.createdAt!,
      updatedAt: address.updatedAt!,
    };
  }
} 