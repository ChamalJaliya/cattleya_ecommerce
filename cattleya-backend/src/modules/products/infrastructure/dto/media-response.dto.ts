import { ApiProperty } from '@nestjs/swagger';

export class MediaFileDto {
  @ApiProperty({ description: 'File key in S3' })
  key: string;

  @ApiProperty({ description: 'Public URL of the file' })
  url: string;

  @ApiProperty({ description: 'Original filename' })
  name: string;

  @ApiProperty({ description: 'File type category', example: 'image' })
  type: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Upload date' })
  uploadDate: Date;

  @ApiProperty({ description: 'Folder path' })
  folder: string;

  @ApiProperty({ description: 'File metadata', required: false })
  metadata?: Record<string, any>;
}

export class UploadResultDto {
  @ApiProperty({ description: 'File key in S3' })
  key: string;

  @ApiProperty({ description: 'Public URL of the file' })
  url: string;

  @ApiProperty({ description: 'Original filename' })
  name: string;

  @ApiProperty({ description: 'File type category', example: 'image' })
  type: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Upload date' })
  uploadDate: Date;

  @ApiProperty({ description: 'Folder path' })
  folder: string;
}

export class MediaStatsDto {
  @ApiProperty({ description: 'Total number of files' })
  totalFiles: number;

  @ApiProperty({ description: 'Total size in bytes' })
  totalSize: number;

  @ApiProperty({ description: 'Total size formatted', example: '1.5 MB' })
  totalSizeFormatted: string;

  @ApiProperty({ description: 'Statistics by file type' })
  byType: Record<string, {
    count: number;
    size: number;
    sizeFormatted: string;
    icon: string;
  }>;

  @ApiProperty({ description: 'Statistics by folder' })
  byFolder: Record<string, {
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export class DownloadUrlDto {
  @ApiProperty({ description: 'Signed download URL' })
  url: string;

  @ApiProperty({ description: 'URL expiration time in seconds' })
  expiresIn: number;
}

export class DeleteResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class BulkDeleteResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Number of files deleted' })
  deletedCount: number;
}

export class MoveResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'New file key' })
  newKey: string;
} 