import { forwardRef, Module } from '@nestjs/common';
import { GetAddressesUseCase } from './use-cases/get-addresses.use-case';
import { CreateAddressUseCase } from './use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './use-cases/update-address.use-case';
import { DeleteAddressUseCase } from './use-cases/delete-address.use-case';
import { SetDefaultAddressUseCase } from './use-cases/set-default-address.use-case';
import { AddressesInfrastructureModule } from '../infrastructure/addresses.infrastructure.module';

@Module({
  imports: [forwardRef(() => AddressesInfrastructureModule)],
  providers: [
    GetAddressesUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    SetDefaultAddressUseCase,
  ],
  exports: [
    GetAddressesUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    SetDefaultAddressUseCase,
  ],
})
export class AddressesApplicationModule {} 