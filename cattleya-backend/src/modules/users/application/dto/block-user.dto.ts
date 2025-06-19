import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({
    description: 'Whether to block or unblock the user',
    example: true
  })
  @IsBoolean()
  isBlocked: boolean;

  @ApiPropertyOptional({
    description: 'Reason for blocking the user',
    example: 'Violation of terms of service'
  })
  @IsOptional()
  @IsString()
  blockReason?: string;
} 