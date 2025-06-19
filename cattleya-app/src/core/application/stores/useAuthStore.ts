import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/core/domain/entities/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@cattleya.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    role: UserRole.ADMIN,
    status: 'ACTIVE' as any,
    avatar: undefined,
    profileCompletion: 100,
    preferences: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC'
    },
    addresses: [],
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: false,
    permissions: ['manage_users', 'manage_products', 'manage_orders', 'view_analytics'],
    department: 'Administration',
    employeeId: 'ADM001',
    isBlocked: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0
  },
  {
    id: '2',
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567891',
    role: UserRole.CUSTOMER,
    status: 'ACTIVE' as any,
    avatar: undefined,
    profileCompletion: 85,
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC'
    },
    addresses: [],
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    isBlocked: false,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    loyaltyPoints: 1250,
    totalOrders: 8,
    totalSpent: 567.89,
    customerSince: new Date('2023-06-15')
  }
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user by email
          const user = mockUsers.find(u => u.email === email);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          // Update last login
          user.lastLoginAt = new Date();
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if user already exists
          const existingUser = mockUsers.find(u => u.email === email);
          if (existingUser) {
            throw new Error('User with this email already exists');
          }
          
          // Create new user
          const newUser: User = {
            id: Date.now().toString(),
            email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone,
            role: UserRole.CUSTOMER,
            status: 'ACTIVE' as any,
            profileCompletion: 60,
            preferences: {
              newsletter: true,
              smsNotifications: false,
              emailNotifications: true,
              language: 'en',
              currency: 'USD',
              timezone: 'UTC'
            },
            addresses: [],
            emailVerified: false,
            phoneVerified: false,
            twoFactorEnabled: false,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
            loyaltyPoints: 0,
            totalOrders: 0,
            totalSpent: 0,
            customerSince: new Date()
          };
          
          mockUsers.push(newUser);
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData, updatedAt: new Date() };
          set({ user: updatedUser });
        }
      },

      checkAuth: async () => {
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 