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
import { customToast } from '../../../shared/utils/toast';

// Import cart store to clear it on logout
import { useCartStore } from './useCartStore';

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
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.login(credentials);
          if (response.authenticated) {
            set({ user: response.user, isAuthenticated: true, isLoading: false });
            customToast.auth.loginSuccess();
            return true;
          } else {
            set({ error: 'Login failed', isLoading: false });
            customToast.auth.loginError();
            return false;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          customToast.auth.loginError();
          return false;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.register(userData);
          if (response.authenticated) {
            set({ user: response.user, isAuthenticated: true, isLoading: false });
            customToast.auth.registerSuccess();
            return true;
          } else {
            set({ error: 'Registration failed', isLoading: false });
            customToast.auth.registerError();
            return false;
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          customToast.auth.registerError();
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await usersApi.logout();
          
          // Clear cart store on logout (skip API call since token is invalid)
          const cartStore = useCartStore.getState();
          cartStore.clearCart(true);
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          customToast.auth.logoutSuccess();
        } catch (error: any) {
          console.error('Logout error:', error);
          // Even if logout fails, clear local state
          const cartStore = useCartStore.getState();
          cartStore.clearCart(true);
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          customToast.auth.logoutSuccess();
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null });
        
        // Check if we have a token stored before making API call
        const hasToken = typeof window !== 'undefined' && (
          localStorage.getItem('access_token') || 
          document.cookie.includes('access_token')
        );
        
        if (!hasToken) {
          // No token found, user is not authenticated
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
          return;
        }
        
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

      updateProfile: async (data: UpdateProfileRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.updateProfile(data);
          
          if (response.success) {
            set({ 
              user: response.data, 
              isLoading: false 
            });
            customToast.auth.profileUpdateSuccess();
            return true;
          } else {
            const errorMessage = response.message || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            customToast.auth.profileUpdateError(errorMessage);
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          customToast.auth.profileUpdateError(errorMessage);
          return false;
        }
      },

      changePassword: async (data: ChangePasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await usersApi.changePassword(data);
          
          if (response.success) {
            set({ isLoading: false });
            customToast.auth.passwordChangeSuccess();
            return true;
          } else {
            const errorMessage = response.message || 'Failed to change password';
            set({ error: errorMessage, isLoading: false });
            customToast.auth.passwordChangeError(errorMessage);
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          customToast.auth.passwordChangeError(errorMessage);
          return false;
        }
      },

      uploadAvatar: async (file: File) => {
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
            customToast.auth.avatarUploadSuccess();
            return response.url;
          } else {
            const errorMessage = 'Failed to upload avatar';
            set({ error: errorMessage, isLoading: false });
            customToast.auth.avatarUploadError(errorMessage);
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          customToast.auth.avatarUploadError(errorMessage);
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