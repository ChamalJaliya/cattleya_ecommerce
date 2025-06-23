import { apiClient } from './apiClient';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  total: number;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

export const categoriesApi = {
  async getAllCategories(includeTree = false): Promise<Category[]> {
    const response = await apiClient.get(`/categories/public?includeTree=${includeTree}`);
    // Backend TransformInterceptor wraps: { data: { success: true, data: [categories], total }, statusCode, timestamp, message }
    // Axios wraps it in response.data, so we need: response.data.data.data
    return response.data?.data?.data || [];
  },

  async getCategoryById(id: string): Promise<{ success: boolean; data?: Category; error?: any }> {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      // Backend returns: { success: true, data: { ...category } }
      return { success: true, data: response.data.data.data };
    } catch (error) {
      return { success: false, error };
    }
  },
  
  async createCategory(data: CreateCategoryDto): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await apiClient.post('/categories', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  },

  async uploadCategoryIcon(file: File): Promise<{ success: boolean; data?: { url: string }; error?: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/products/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // The backend response is in response.data. It might be wrapped in an additional 'data' object.
      const responseData = response.data;
      const url = responseData?.data?.url || responseData?.url;

      if (url) {
        return { success: true, data: { url } };
      } else {
        console.error('URL not found in response:', responseData);
        return { success: false, error: 'URL not found in response' };
      }
    } catch (error) {
      console.error('Error uploading category icon:', error);
      return { success: false, error };
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      await apiClient.delete(`/categories/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async updateCategory(id: string, data: Partial<UpdateCategoryDto>): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await apiClient.put(`/categories/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  },
}; 