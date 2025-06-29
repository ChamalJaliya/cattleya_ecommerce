import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Message to send to the chatbot' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Session ID for the conversation', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'User experience level', required: false, enum: ['beginner', 'intermediate', 'expert'] })
  @IsOptional()
  @IsString()
  userExperience?: string;

  @ApiProperty({ description: 'Additional context for the message', required: false })
  @IsOptional()
  @IsString()
  context?: string;
} 