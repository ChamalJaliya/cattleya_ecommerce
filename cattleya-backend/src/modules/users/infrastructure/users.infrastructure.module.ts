import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { UsersApplicationModule } from '../application/users.application.module';
import { SharedModule } from '../../../shared/shared.module';

const USER_REPOSITORY = 'IUserRepository';

@Module({
  imports: [
    SharedModule, // For PrismaService
    UsersApplicationModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersInfrastructureModule {} 