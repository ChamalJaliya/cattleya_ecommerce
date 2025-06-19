import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { User, UserRole } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserRequest extends CreateUserDto {}

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(request.password, saltRounds);

    // Create user entity using static factory method
    const user = User.create({
      email: request.email,
      password: hashedPassword,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      role: (request.role as UserRole) || UserRole.CUSTOMER,
      isBlocked: false,
    });

    const createdUser = await this.userRepository.create(user);
    return UserMapper.toResponse(createdUser);
  }
} 