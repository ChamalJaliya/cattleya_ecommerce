import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class UploadVariantImageDto {
  @IsString() altText: string;
  @IsOptional() @IsBoolean() isMain?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class AssociateImagesDto {
  @IsArray() @IsString({ each: true }) imageIds: string[];
}

export class ReorderImagesDto {
  @IsArray() imageOrder: { id: string; sortOrder: number }[];
}

export class VariantImageResponseDto {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  sortOrder: number;
  variantId: string;
  createdAt: Date;
} 