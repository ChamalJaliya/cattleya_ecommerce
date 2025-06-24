import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { AddressRepository } from '../../domain/repositories/address.repository.interface';
import { Address } from '../../domain/entities/address.entity';

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return addresses.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: { id }
    });

    return address ? this.mapToDomain(address) : null;
  }

  async create(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const createdAddress = await this.prisma.address.create({
      data: {
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
      }
    });

    return this.mapToDomain(createdAddress);
  }

  async update(id: string, address: Partial<Address>): Promise<Address> {
    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: {
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
      }
    });

    return this.mapToDomain(updatedAddress);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id }
    });
  }

  async setDefault(id: string, userId: string, type: 'shipping' | 'billing'): Promise<void> {
    // First, unset all addresses of the same type for this user
    await this.prisma.address.updateMany({
      where: {
        userId,
        type,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });

    // Then, set the specified address as default (if id is provided)
    if (id) {
      await this.prisma.address.update({
        where: { id },
        data: {
          isDefault: true
        }
      });
    }
  }

  private mapToDomain(prismaAddress: any): Address {
    return {
      id: prismaAddress.id,
      userId: prismaAddress.userId,
      type: prismaAddress.type as 'shipping' | 'billing',
      label: prismaAddress.label,
      firstName: prismaAddress.firstName,
      lastName: prismaAddress.lastName,
      company: prismaAddress.company,
      street: prismaAddress.street,
      apartment: prismaAddress.apartment,
      city: prismaAddress.city,
      state: prismaAddress.state,
      zipCode: prismaAddress.zipCode,
      country: prismaAddress.country,
      phone: prismaAddress.phone,
      isDefault: prismaAddress.isDefault,
      createdAt: prismaAddress.createdAt,
      updatedAt: prismaAddress.updatedAt,
    };
  }
} 