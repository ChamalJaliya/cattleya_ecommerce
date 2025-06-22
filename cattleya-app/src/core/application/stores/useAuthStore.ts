import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/core/domain/entities/User';
import { 
  usersApi, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest, 
  ChangePasswordRequest 
} from '@/core/infrastructure/api/users.api';
import { ApiError } from '@/core/infrastructure/api/base-api.service';
import toast from 'react-hot-toast';

interface AuthState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  
  // Helper methods
  isAdmin: () => boolean;
  isStaff: () => boolean;
  getInitials: () => string;
  getFullName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // API actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.login(credentials);
          
          if (response.authenticated) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ error: 'Login failed', isLoading: false });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.register(userData);
          
          if (response.authenticated) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ error: 'Registration failed', isLoading: false });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await usersApi.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Even if logout fails on server, clear local state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const authStatus = await usersApi.checkAuth();
          
          if (authStatus.authenticated) {
            // Get full profile if authenticated
            const profileResponse = await usersApi.getProfile();
            set({ 
              user: profileResponse.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          // If auth check fails, user is not authenticated
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },

      getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.getProfile();
          
          if (response.success) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ error: 'Failed to fetch profile', isLoading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          
          // If unauthorized, clear auth state
          if (error instanceof ApiError && error.status === 401) {
            set({ user: null, isAuthenticated: false });
          }
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.updateProfile(data);
          
          if (response.success) {
            set({ 
              user: response.data, 
              isLoading: false 
            });
            toast.success('Profile updated successfully!');
            return true;
          } else {
            const errorMessage = response.message || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.changePassword(data);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Password changed successfully!');
            return true;
          } else {
            const errorMessage = response.message || 'Failed to change password';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.uploadAvatar(file);
          
          if (response.success) {
            // Update user avatar in state
            const { user } = get();
            if (user) {
              const updatedUser = { ...user, avatar: response.url };
              set({ user: updatedUser, isLoading: false });
            }
            toast.success('Avatar uploaded successfully!');
            return response.url;
          } else {
            const errorMessage = 'Failed to upload avatar';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return null;
        }
      },

      // Helper methods
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },

      isStaff: () => {
        const { user } = get();
        return user?.role === 'ADMIN' || user?.role === 'STAFF';
      },

      getInitials: () => {
        const { user } = get();
        if (!user) return '';
        
        const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
        const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
        return `${firstInitial}${lastInitial}`;
      },

      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 