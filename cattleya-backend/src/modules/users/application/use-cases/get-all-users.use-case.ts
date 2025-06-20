import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface GetAllUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(page: number, limit: number): Promise<GetAllUsersResult> {
    return await this.userRepository.findAll(page, limit);
  }
} 