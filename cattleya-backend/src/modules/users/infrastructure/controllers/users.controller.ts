import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Request,
  HttpStatus,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { BlockUserUseCase } from '../../application/use-cases/block-user.use-case';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';

import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateProfileDto, ChangePasswordDto } from '../../application/dto/update-profile.dto';
import { BlockUserDto } from '../../application/dto/block-user.dto';
import { UserResponseDto, UserProfileResponseDto, FileUploadResponseDto } from '../../application/dto/user-response.dto';
import { UserMapper } from '../../application/mappers/user.mapper';

import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';
import { S3Service } from '../../../../shared/s3/s3.service';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads', 'avatars');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already exists'
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(createUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found'
  })
  async getProfile(@Request() req): Promise<UserProfileResponseDto> {
    const user = await this.getProfileUseCase.execute(req.user.id);
    return {
      success: true,
      data: UserMapper.toResponse(user),
      message: 'Profile retrieved successfully'
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates the profile information of the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<UserProfileResponseDto> {
    const user = await this.updateProfileUseCase.execute(req.user.id, updateProfileDto);
    return {
      success: true,
      data: UserMapper.toResponse(user),
      message: 'Profile updated successfully'
    };
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Changes the password of the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password changed successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid password data'
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ success: boolean; message: string }> {
    await this.updateProfileUseCase.changePassword(req.user.id, changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload user avatar',
    description: 'Uploads and sets a new avatar image for the authenticated user'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (max 5MB, jpg/jpeg/png only)'
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully', type: FileUploadResponseDto })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid file format or size'
  })
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    const avatarInfo = await this.s3Service.uploadFile(file, `avatars/${req.user.id}`);
    await this.updateProfileUseCase.updateAvatar(req.user.id, avatarInfo.url);
    
    return {
      message: 'Avatar uploaded successfully',
      url: avatarInfo.url,
      key: avatarInfo.key,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieves a paginated list of all users. Requires admin or staff role.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            users: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions'
  })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const result = await this.getAllUsersUseCase.execute(pageNum, limitNum);
    
    return {
      success: true,
      data: {
        users: result.users.map(user => UserMapper.toResponse(user)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user by ID (Admin only)',
    description: 'Retrieves a specific user by their ID. Requires admin or staff role.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found'
  })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getProfileUseCase.execute(id);
    return UserMapper.toResponse(user);
  }

  @Put(':id/block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Block user (Admin only)',
    description: 'Blocks a specific user. Requires admin role.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User blocked successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found'
  })
  async blockUser(
    @Param('id') id: string,
    @Body() blockUserDto: BlockUserDto,
    @Request() req
  ): Promise<{ success: boolean; message: string }> {
    await this.blockUserUseCase.execute({
      userId: id,
      adminId: req.user.id,
      isBlocked: blockUserDto.isBlocked,
      blockReason: blockUserDto.blockReason,
    });

    return {
      success: true,
      message: 'User blocked successfully'
    };
  }

  @Get(':id/avatars')
  @ApiOperation({ summary: 'List user avatars' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of avatar image URLs', schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      avatars: { type: 'array', items: { type: 'string' } },
    }
  }})
  async listUserAvatars(@Param('id') id: string) {
    const avatars = await this.s3Service.listFiles(`avatars/${id}/`);
    return { success: true, avatars };
  }

  @Delete(':id/avatars/:key')
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'S3 object key (URL-encoded, e.g. avatars%2Fid%2Ffilename.jpg)' })
  @ApiResponse({ status: 200, description: 'Avatar deleted successfully', schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    }
  }})
  async deleteUserAvatar(@Param('id') id: string, @Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    await this.s3Service.deleteFile(decodedKey);
    return { success: true, message: 'Avatar deleted successfully' };
  }
} 