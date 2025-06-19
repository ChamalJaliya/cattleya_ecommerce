import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserRequest } from '../use-cases/create-user.use-case';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      blockedAt: user.blockedAt,
      blockReason: user.blockReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toCreateRequest(dto: CreateUserDto): CreateUserRequest {
    return {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      role: dto.role,
      phone: dto.phone,
    };
  }

  static toResponseArray(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponse(user));
  }
} 