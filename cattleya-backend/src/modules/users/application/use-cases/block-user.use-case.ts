import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { BlockUserDto } from '../dto/block-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

export interface BlockUserRequest extends BlockUserDto {
  userId: string;
  adminId: string;
}

@Injectable()
export class BlockUserUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(request: BlockUserRequest): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(request.userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const admin = await this.userRepository.findById(request.adminId);
    if (!admin || !admin.isStaff()) {
      throw new ForbiddenException('Only admins can block/unblock users');
    }

    if (request.isBlocked) {
      user.blockUser(request.adminId, request.blockReason);
    } else {
      user.unblockUser();
    }

    // Since we need to update blocking fields, we'll need to extend the repository
    // For now, let's create a simple update
    const updateData = {
      isBlocked: user.isBlocked,
      blockedAt: user.blockedAt,
      blockedBy: user.blockedBy,
      blockReason: user.blockReason,
    };

    const updatedUser = await this.userRepository.update(request.userId, updateData as any);
    return UserMapper.toResponse(updatedUser);
  }
} 