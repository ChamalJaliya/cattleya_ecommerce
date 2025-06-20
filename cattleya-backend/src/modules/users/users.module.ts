import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { BlockUserUseCase } from './application/use-cases/block-user.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';

const USER_REPOSITORY = 'IUserRepository';

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    CreateUserUseCase,
    UpdateProfileUseCase,
    BlockUserUseCase,
    GetProfileUseCase,
    GetAllUsersUseCase,
  ],
  exports: [USER_REPOSITORY, CreateUserUseCase, UpdateProfileUseCase, BlockUserUseCase, GetProfileUseCase, GetAllUsersUseCase],
})
export class UsersModule {} 