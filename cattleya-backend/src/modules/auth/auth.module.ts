import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthApplicationModule } from './application/auth.application.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    AuthApplicationModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {} 