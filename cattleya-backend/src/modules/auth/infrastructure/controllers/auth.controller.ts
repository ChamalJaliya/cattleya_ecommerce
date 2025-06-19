import { 
  Controller, 
  Post, 
  Body, 
  Res, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Get, 
  Req 
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthUseCase } from '../../application/use-cases/auth.use-case';
import { LoginDto, LoginResponseDto } from '../../application/dto/login.dto';
import { RegisterDto, RegisterResponseDto } from '../../application/dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account. Default role is CUSTOMER. Use ADMIN or STAFF for elevated permissions.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with email already exists',
    example: {
      statusCode: 409,
      message: 'User with this email already exists',
      error: 'Conflict'
    }
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<RegisterResponseDto> {
    const result = await this.authUseCase.register(registerDto);
    
    // Generate JWT token
    const user = await this.authUseCase.validateUser(registerDto.email);
    const token = this.authUseCase.generateJwtToken(user);
    
    // Set HTTP-only cookie
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns user info and sets authentication cookie.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    example: {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized'
    }
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponseDto> {
    const result = await this.authUseCase.login(loginDto);
    
    // Generate JWT token
    const user = await this.authUseCase.validateUser(loginDto.email);
    const token = this.authUseCase.generateJwtToken(user);
    
    // Set HTTP-only cookie
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Clear authentication cookie to logout user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    example: {
      message: 'Logout successful'
    }
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Get authenticated user profile information. Requires authentication cookie or Bearer token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    example: {
      user: {
        id: '64f5b123abc12345',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'CUSTOMER',
        avatar: null
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required',
    example: {
      statusCode: 401,
      message: 'Unauthorized'
    }
  })
  async getProfile(@Req() request: Request) {
    const user = request.user;
    return { user };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Check authentication status',
    description: 'Verify if user is authenticated and return basic info.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication valid',
    example: {
      authenticated: true,
      role: 'CUSTOMER'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Not authenticated'
  })
  async checkAuth(@Req() request: Request) {
    const user = request.user as any;
    return {
      authenticated: true,
      role: user.role,
    };
  }
} 