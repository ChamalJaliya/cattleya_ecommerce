import { BaseApiService, ApiResponse } from './base-api.service';
import { User } from '../../domain/entities/User';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  authenticated: boolean;
  message: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface FileUploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export class UsersApiService extends BaseApiService {
  private readonly endpoint = '/users';
  private readonly authEndpoint = '/auth';

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(`${this.authEndpoint}/login`, credentials);
    
    // Token is set as HTTP-only cookie by the backend
    // No need to manually set token here
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(`${this.authEndpoint}/register`, userData);
    
    // Token is set as HTTP-only cookie by the backend
    // No need to manually set token here
    
    return response;
  }

  async logout(): Promise<void> {
    await this.post(`${this.authEndpoint}/logout`);
    this.clearToken();
  }

  async checkAuth(): Promise<{ authenticated: boolean; role?: string }> {
    return this.get<{ authenticated: boolean; role?: string }>(`${this.authEndpoint}/check`);
  }

  // Profile methods
  async getProfile(): Promise<UserProfileResponse> {
    return this.get<UserProfileResponse>(`${this.endpoint}/profile`);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    return this.put<UserProfileResponse>(`${this.endpoint}/profile`, data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.endpoint}/change-password`, data);
  }

  async uploadAvatar(file: File): Promise<FileUploadResponse> {
    return this.uploadFile<FileUploadResponse>(`${this.endpoint}/avatar`, file, 'avatar');
  }

  // Admin methods (if user has admin role)
  async getAllUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return this.get<ApiResponse<any>>(`${this.endpoint}?page=${page}&limit=${limit}`);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`${this.endpoint}/${id}`);
  }

  async blockUser(id: string, isBlocked: boolean, reason?: string): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.endpoint}/${id}/block`, {
      isBlocked,
      blockReason: reason
    });
  }
}

// Export singleton instance
export const usersApi = new UsersApiService(); 