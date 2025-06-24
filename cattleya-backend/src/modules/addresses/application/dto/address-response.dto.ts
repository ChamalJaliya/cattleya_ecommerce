import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439014' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439015' })
  userId: string;

  @ApiProperty({ example: 'shipping' })
  type: 'shipping' | 'billing';

  @ApiProperty({ example: 'Home' })
  label?: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'Acme Corp' })
  company?: string;

  @ApiProperty({ example: '123 Garden St' })
  street: string;

  @ApiProperty({ example: 'Apt 4B' })
  apartment?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiProperty({ example: '10001' })
  zipCode: string;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: true })
  isDefault: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
} 