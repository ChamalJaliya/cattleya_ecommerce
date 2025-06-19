import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin@cattleya.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'User password',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    avatar?: string;
  };

  @ApiProperty({ 
    description: 'Authentication status',
    example: true
  })
  authenticated: boolean;

  @ApiProperty({ 
    description: 'Success message',
    example: 'Login successful'
  })
  message: string;
} 