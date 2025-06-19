import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

export interface UpdateProfileRequest extends UpdateProfileDto {
  userId: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(request: UpdateProfileRequest): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(request.userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Account is blocked and cannot be updated');
    }

    // Update user profile
    const updateData = {
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      avatar: request.avatar,
    };

    const updatedUser = await this.userRepository.update(request.userId, updateData);
    return UserMapper.toResponse(updatedUser);
  }
} 