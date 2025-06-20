import { Module, forwardRef } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { BlockUserUseCase } from './use-cases/block-user.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { GetAllUsersUseCase } from './use-cases/get-all-users.use-case';

@Module({
  providers: [
    CreateUserUseCase,
    UpdateProfileUseCase,
    BlockUserUseCase,
    GetProfileUseCase,
    GetAllUsersUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateProfileUseCase,
    BlockUserUseCase,
    GetProfileUseCase,
    GetAllUsersUseCase,
  ],
})
export class UsersApplicationModule {} 