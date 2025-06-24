import { forwardRef, Module } from '@nestjs/common';
import { AddressesController } from './controllers/addresses.controller';
import { PrismaAddressRepository } from './repositories/address.repository';
import { AddressesApplicationModule } from '../application/addresses.application.module';

@Module({
  imports: [forwardRef(() => AddressesApplicationModule)],
  controllers: [AddressesController],
  providers: [
    {
      provide: 'AddressRepository',
      useClass: PrismaAddressRepository,
    },
  ],
  exports: ['AddressRepository'],
})
export class AddressesInfrastructureModule {} 