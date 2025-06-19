import { Module, forwardRef } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { BlockUserUseCase } from './use-cases/block-user.use-case';

@Module({
  providers: [
    CreateUserUseCase,
    UpdateProfileUseCase,
    BlockUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateProfileUseCase,
    BlockUserUseCase,
  ],
})
export class UsersApplicationModule {} 