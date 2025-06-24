import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetAddressesUseCase } from '../../application/use-cases/get-addresses.use-case';
import { CreateAddressUseCase } from '../../application/use-cases/create-address.use-case';
import { UpdateAddressUseCase } from '../../application/use-cases/update-address.use-case';
import { DeleteAddressUseCase } from '../../application/use-cases/delete-address.use-case';
import { SetDefaultAddressUseCase } from '../../application/use-cases/set-default-address.use-case';
import { CreateAddressDto } from '../../application/dto/create-address.dto';
import { UpdateAddressDto } from '../../application/dto/update-address.dto';
import { AddressResponseDto } from '../../application/dto/address-response.dto';
import { AddressMapper } from '../../application/mappers/address.mapper';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly getAddressesUseCase: GetAddressesUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    type: [AddressResponseDto],
  })
  async getAddresses(@Request() req: any) {
    const { addresses } = await this.getAddressesUseCase.execute({
      userId: req.user.id,
    });

    return addresses.map(AddressMapper.toResponseDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: AddressResponseDto,
  })
  async createAddress(
    @Request() req: any,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const { address } = await this.createAddressUseCase.execute({
      userId: req.user.id,
      addressData: createAddressDto,
    });

    return AddressMapper.toResponseDto(address);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    type: AddressResponseDto,
  })
  async updateAddress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const { address } = await this.updateAddressUseCase.execute({
      id,
      userId: req.user.id,
      addressData: updateAddressDto,
    });

    return AddressMapper.toResponseDto(address);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({
    status: 204,
    description: 'Address deleted successfully',
  })
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    await this.deleteAddressUseCase.execute({
      id,
      userId: req.user.id,
    });
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({
    status: 200,
    description: 'Address set as default successfully',
  })
  async setDefaultAddress(@Request() req: any, @Param('id') id: string) {
    await this.setDefaultAddressUseCase.execute({
      id,
      userId: req.user.id,
    });
  }
} 