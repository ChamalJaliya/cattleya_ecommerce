import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF'
}

export class RegisterDto {
  @ApiProperty({ 
    example: 'John',
    description: 'User first name'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'User last name'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
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

  @ApiProperty({ 
    example: '+1234567890',
    description: 'User phone number',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'User role',
    default: UserRole.CUSTOMER
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class RegisterResponseDto {
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
    description: 'Success message',
    example: 'Registration successful'
  })
  message: string;
} 