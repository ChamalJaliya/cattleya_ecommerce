import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ 
    description: 'User ID', 
    example: '507f1f77bcf86cd799439011' 
  })
  id: string;

  @ApiProperty({ 
    description: 'User email address', 
    example: 'john.doe@example.com' 
  })
  email: string;

  @ApiProperty({ 
    description: 'User first name', 
    example: 'John' 
  })
  firstName: string;

  @ApiProperty({ 
    description: 'User last name', 
    example: 'Doe' 
  })
  lastName: string;

  @ApiProperty({ 
    description: 'User full name', 
    example: 'John Doe' 
  })
  fullName: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole,
    example: UserRole.CUSTOMER
  })
  role: UserRole;

  @ApiPropertyOptional({ 
    description: 'User phone number', 
    example: '+1234567890' 
  })
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'User avatar URL', 
    example: 'https://example.com/avatar.jpg' 
  })
  avatar?: string;

  @ApiProperty({ 
    description: 'Whether user is blocked', 
    example: false 
  })
  isBlocked: boolean;

  @ApiPropertyOptional({ 
    description: 'When user was blocked', 
    example: '2024-01-15T10:30:00Z' 
  })
  blockedAt?: Date;

  @ApiPropertyOptional({ 
    description: 'Who blocked the user', 
    example: 'admin@example.com' 
  })
  blockedBy?: string;

  @ApiPropertyOptional({ 
    description: 'Reason for blocking', 
    example: 'Violation of terms of service' 
  })
  blockReason?: string;

  @ApiProperty({ 
    description: 'User creation date', 
    example: '2024-01-15T10:30:00Z' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'User last update date', 
    example: '2024-01-15T10:30:00Z' 
  })
  updatedAt: Date;
}

export class UserProfileResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'User profile data', type: UserResponseDto })
  data: UserResponseDto;

  @ApiPropertyOptional({ description: 'Success message' })
  message?: string;
}

export class FileUploadResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Uploaded file URL', example: 'https://example.com/uploads/avatar.jpg' })
  url: string;

  @ApiProperty({ description: 'File name', example: 'avatar.jpg' })
  filename: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  size: number;

  @ApiProperty({ description: 'Upload timestamp', example: '2024-01-15T10:30:00Z' })
  uploadedAt: Date;
} 