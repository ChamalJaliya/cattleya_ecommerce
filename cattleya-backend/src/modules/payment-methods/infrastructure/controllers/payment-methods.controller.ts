import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Put, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetPaymentMethodsUseCase } from '../../application/use-cases/get-payment-methods.use-case';
import { CreateSetupIntentUseCase } from '../../application/use-cases/create-setup-intent.use-case';
import { AddPaymentMethodUseCase } from '../../application/use-cases/add-payment-method.use-case';
import { DeletePaymentMethodUseCase } from '../../application/use-cases/delete-payment-method.use-case';
import { SetDefaultPaymentMethodUseCase } from '../../application/use-cases/set-default-payment-method.use-case';
import { PaymentMethodResponseDto } from '../../application/dto/payment-method-response.dto';
import { SetupIntentResponseDto } from '../../application/dto/setup-intent-response.dto';

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentMethodsController {
  constructor(
    private readonly getPaymentMethodsUseCase: GetPaymentMethodsUseCase,
    private readonly createSetupIntentUseCase: CreateSetupIntentUseCase,
    private readonly addPaymentMethodUseCase: AddPaymentMethodUseCase,
    private readonly deletePaymentMethodUseCase: DeletePaymentMethodUseCase,
    private readonly setDefaultPaymentMethodUseCase: SetDefaultPaymentMethodUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment methods retrieved successfully',
    type: [PaymentMethodResponseDto],
  })
  async getPaymentMethods(@Request() req): Promise<PaymentMethodResponseDto[]> {
    return this.getPaymentMethodsUseCase.execute(req.user.id);
  }

  @Post('setup-intent')
  @ApiOperation({ summary: 'Create setup intent for adding payment method' })
  @ApiResponse({ 
    status: 201, 
    description: 'Setup intent created successfully',
    type: SetupIntentResponseDto,
  })
  async createSetupIntent(@Request() req): Promise<SetupIntentResponseDto> {
    return this.createSetupIntentUseCase.execute(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add payment method after setup intent confirmation' })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment method added successfully',
    type: PaymentMethodResponseDto,
  })
  async addPaymentMethod(
    @Request() req,
    @Body() body: { setupIntentId: string },
  ): Promise<PaymentMethodResponseDto> {
    return this.addPaymentMethodUseCase.execute(req.user.id, body.setupIntentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ 
    status: 204, 
    description: 'Payment method deleted successfully',
  })
  async deletePaymentMethod(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.deletePaymentMethodUseCase.execute(req.user.id, id);
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Set payment method as default' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment method set as default successfully',
    type: PaymentMethodResponseDto,
  })
  async setDefaultPaymentMethod(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.setDefaultPaymentMethodUseCase.execute(req.user.id, id);
  }
} 