import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

export interface MediaFile {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  folder: string;
  metadata?: Record<string, any>;
}

export interface UploadResult {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  folder: string;
}

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws');
    const region = awsConfig?.region;
    const accessKeyId = awsConfig?.accessKeyId;
    const secretAccessKey = awsConfig?.secretAccessKey;
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured. Please set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables.');
    }
    
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    
    const bucket = awsConfig?.s3BucketName;
    
    if (!bucket) {
      throw new Error('S3 bucket not configured. Please set S3_BUCKET environment variable.');
    }
    
    this.bucket = bucket;
  }

  async uploadFile(file: Express.Multer.File, folder = 'media', metadata?: Record<string, any>): Promise<UploadResult> {
    try {
      // Check if we have the necessary configuration
      if (!this.bucket) {
        throw new Error('S3 bucket not configured');
      }

      const fileExt = file.originalname.split('.').pop();
      const fileName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
      const key = `${folder}/${uuidv4()}-${fileName}.${fileExt}`;
      
      const uploadParams = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: metadata?.uploadedBy || 'system',
          ...metadata,
        },
      };

      await this.s3.send(new PutObjectCommand(uploadParams));
      
      const presignedUrl = await this.getSignedUrl(key);
      
      return {
        key,
        url: presignedUrl,
        name: file.originalname,
        type: this.getFileType(file.mimetype),
        size: file.size,
        mimeType: file.mimetype,
        uploadDate: new Date(),
        folder,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder = 'media', metadata?: Record<string, any>): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, metadata));
    return Promise.all(uploadPromises);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async listFiles(prefix: string = 'media'): Promise<MediaFile[]> {
    try {
      // Check if we have the necessary configuration
      if (!this.bucket) {
        console.warn('S3 bucket not configured, returning empty list');
        return [];
      }

      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });
      
      const response = await this.s3.send(command);
      const files: MediaFile[] = [];

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            try {
              const headCommand = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: obj.Key,
              });
              const headResponse = await this.s3.send(headCommand);

              const fileName = obj.Key.split('/').pop() || '';
              const folder = obj.Key.split('/').slice(0, -1).join('/') || 'media';

              const presignedUrl = await this.getSignedUrl(obj.Key);

              files.push({
                key: obj.Key,
                url: presignedUrl,
                name: fileName,
                type: this.getFileType(headResponse.ContentType || 'application/octet-stream'),
                size: obj.Size || 0,
                mimeType: headResponse.ContentType || 'application/octet-stream',
                uploadDate: obj.LastModified || new Date(),
                folder,
                metadata: headResponse.Metadata,
              });
            } catch (error) {
              console.error(`Error getting metadata for ${obj.Key}:`, error);
            }
          }
        }
      }

      return files.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    } catch (error) {
      console.error('Error listing files from S3:', error);
      // Return empty array instead of throwing to prevent frontend crashes
      return [];
    }
  }

  async listFilesByType(type: string, prefix: string = 'media'): Promise<MediaFile[]> {
    const allFiles = await this.listFiles(prefix);
    return allFiles.filter(file => file.type === type);
  }

  async listFilesByFolder(folder: string): Promise<MediaFile[]> {
    return this.listFiles(folder);
  }

  async getFileInfo(key: string): Promise<MediaFile | null> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.s3.send(headCommand);
      
      const fileName = key.split('/').pop() || '';
      const folder = key.split('/').slice(0, -1).join('/') || 'media';
      
      const presignedUrl = await this.getSignedUrl(key);

      return {
        key,
        url: presignedUrl,
        name: fileName,
        type: this.getFileType(response.ContentType || 'application/octet-stream'),
        size: response.ContentLength || 0,
        mimeType: response.ContentType || 'application/octet-stream',
        uploadDate: response.LastModified || new Date(),
        folder,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error(`Error getting file info for ${key}:`, error);
      return null;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3.send(command);
    } catch (error) {
      console.error(`Error deleting file ${key}:`, error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      // Copy the file to the new location
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      });
      await this.s3.send(copyCommand);

      // Delete the original file
      await this.deleteFile(sourceKey);
    } catch (error) {
      console.error(`Error moving file from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, { count: number; size: number }>;
    byFolder: Record<string, { count: number; size: number }>;
  }> {
    try {
      const allFiles = await this.listFiles();
      
      const stats = {
        totalFiles: allFiles.length,
        totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
        byType: {} as Record<string, { count: number; size: number }>,
        byFolder: {} as Record<string, { count: number; size: number }>,
      };

      allFiles.forEach(file => {
        // Count by type
        if (!stats.byType[file.type]) {
          stats.byType[file.type] = { count: 0, size: 0 };
        }
        stats.byType[file.type].count++;
        stats.byType[file.type].size += file.size;

        // Count by folder
        if (!stats.byFolder[file.folder]) {
          stats.byFolder[file.folder] = { count: 0, size: 0 };
        }
        stats.byFolder[file.folder].count++;
        stats.byFolder[file.folder].size += file.size;
      });

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        byFolder: {},
      };
    }
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('archive') || mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'other';
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'presentation': return '📈';
      case 'archive': return '📦';
      default: return '📁';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 