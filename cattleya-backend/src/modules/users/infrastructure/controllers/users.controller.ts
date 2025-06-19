import { 
  Controller, 
  Post, 
  Get, 
  Put,
  Patch,
  Body, 
  Param, 
  Query, 
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { BlockUserUseCase } from '../../application/use-cases/block-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateProfileDto } from '../../application/dto/update-profile.dto';
import { BlockUserDto } from '../../application/dto/block-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { UserMapper } from '../../application/mappers/user.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly blockUserUseCase: BlockUserUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists' 
  })
  async createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const createUserRequest = UserMapper.toCreateRequest(createUserDto);
    return await this.createUserUseCase.execute(createUserRequest);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: [UserResponseDto] 
  })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    // This would need a GetUsersUseCase implementation
    return {
      users: [],
      total: 0,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    // This would need a GetUserByIdUseCase implementation
    throw new Error('Not implemented yet');
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Account is blocked' 
  })
  async updateProfile(
    @Request() req: any,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto
  ): Promise<UserResponseDto> {
    return this.updateProfileUseCase.execute({
      userId: req.user.id,
      ...updateProfileDto,
    });
  }

  @Patch(':id/block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Block or unblock a user (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User block status updated successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async blockUser(
    @Request() req: any,
    @Param('id') userId: string,
    @Body(ValidationPipe) blockUserDto: BlockUserDto
  ): Promise<UserResponseDto> {
    return this.blockUserUseCase.execute({
      userId,
      adminId: req.user.id,
      ...blockUserDto,
    });
  }
} 