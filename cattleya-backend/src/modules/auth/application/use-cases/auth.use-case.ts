import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { RegisterDto, RegisterResponseDto, UserRole } from '../dto/register.dto';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { User, UserRole as DomainUserRole } from '../../../users/domain/entities/user.entity';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      authenticated: true,
      message: 'Login successful',
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, firstName, lastName, phone, role } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role ? role as any : DomainUserRole.CUSTOMER,
      isBlocked: false,
    });

    const savedUser = await this.userRepository.create(user);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        fullName: savedUser.fullName,
        role: savedUser.role,
        avatar: savedUser.avatar,
      },
      message: 'Registration successful',
    };
  }

  async validateUser(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  generateJwtToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
} 