import { Module } from '@nestjs/common';
import { AddressesDomainModule } from './domain/addresses.domain.module';
import { AddressesApplicationModule } from './application/addresses.application.module';
import { AddressesInfrastructureModule } from './infrastructure/addresses.infrastructure.module';

@Module({
  imports: [
    AddressesDomainModule,
    AddressesApplicationModule,
    AddressesInfrastructureModule,
  ],
})
export class AddressesModule {} 