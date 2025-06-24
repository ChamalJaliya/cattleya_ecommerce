import { apiClient } from './apiClient';

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

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  byType: Record<string, {
    count: number;
    size: number;
    sizeFormatted: string;
    icon: string;
  }>;
  byFolder: Record<string, {
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export interface MediaStatsResponse {
  data: MediaStats;
  statusCode: number;
  timestamp: string;
  message: string;
}

export interface DownloadUrl {
  url: string;
  expiresIn: number;
}

export interface DeleteResponse {
  message: string;
}

export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}

export interface MoveResponse {
  message:string;
  newKey: string;
}

class MediaApi {
  // ===== GENERAL MEDIA MANAGEMENT =====

  async uploadFile(file: File, folder?: string, metadata?: Record<string, any>): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post('/products/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadMultipleFiles(files: File[], folder?: string, metadata?: Record<string, any>): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post('/products/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async listMedia(params?: {
    type?: string;
    folder?: string;
    search?: string;
  }): Promise<MediaFile[]> {
    try {
      const response = await apiClient.get('/products/media', { params });
      // The API wraps the array in a `data` property, so we extract it here.
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Error listing media files:', error);
      // Return empty array on error to prevent filter issues
      return [];
    }
  }

  async getMediaStats(): Promise<MediaStatsResponse> {
    const response = await apiClient.get('/products/media/stats');
    return response.data;
  }

  async getMediaInfo(key: string): Promise<MediaFile> {
    const response = await apiClient.get(`/products/media/${encodeURIComponent(key)}`);
    return response.data;
  }

  async getDownloadUrl(key: string, expiresIn?: number): Promise<DownloadUrl> {
    const params = expiresIn ? { expiresIn } : {};
    const response = await apiClient.get(`/products/media/${encodeURIComponent(key)}/download`, { params });
    return response.data;
  }

  async deleteMedia(key: string): Promise<DeleteResponse> {
    const response = await apiClient.delete(`/products/media/${encodeURIComponent(key)}`);
    return response.data;
  }

  async deleteMultipleMedia(keys: string[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.delete('/products/media/bulk-delete', {
      data: { keys },
    });
    return response.data;
  }

  async moveMedia(key: string, destinationKey: string): Promise<MoveResponse> {
    const response = await apiClient.post(`/products/media/${encodeURIComponent(key)}/move`, {
      destinationKey,
    });
    return response.data;
  }

  // ===== PRODUCT-SPECIFIC MEDIA =====

  async uploadProductImages(productId: string, images: File[]): Promise<UploadResult[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));

    const response = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getProductImages(productId: string): Promise<MediaFile[]> {
    const response = await apiClient.get(`/products/${productId}/images`);
    return response.data;
  }

  async deleteProductImage(productId: string, imageKey: string): Promise<DeleteResponse> {
    const response = await apiClient.delete(`/products/${productId}/images/${encodeURIComponent(imageKey)}`);
    return response.data;
  }

  // ===== DOCUMENT MANAGEMENT =====

  async uploadDocument(document: File, category?: string, metadata?: Record<string, any>): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('document', document);
    if (category) formData.append('category', category);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post('/products/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async listDocuments(category?: string): Promise<MediaFile[]> {
    const params = category ? { category } : {};
    const response = await apiClient.get('/products/documents', { params });
    return response.data;
  }

  // ===== SHARABLE CONTENT =====

  async uploadSharableContent(files: File[], type?: string, metadata?: Record<string, any>): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (type) formData.append('type', type);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post('/products/sharables/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async listSharableContent(type?: string): Promise<MediaFile[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get('/products/sharables', { params });
    return response.data;
  }

  // ===== UTILITY METHODS =====

  getFileIcon(type: string): string {
    switch (type) {
      case 'image': return '🌺';
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileType(mimeType: string): string {
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

  isValidFileType(file: File, allowedTypes: string[]): boolean {
    const fileType = this.getFileType(file.type);
    return allowedTypes.includes(fileType);
  }

  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  isFileSizeValid(file: File): boolean {
    return file.size <= this.getMaxFileSize();
  }

  async listFolders(): Promise<string[]> {
    // Call the backend with an empty prefix to get all top-level folders
    const response = await apiClient.get('/products/media/folders', { params: { prefix: '' } });
    return response.data.data;
  }

  async createFolder(folderName: string): Promise<{ success: boolean; folder: string }> {
    const response = await apiClient.post('/products/media/folders', { folderName });
    return response.data;
  }
}

export const mediaApi = new MediaApi(); 