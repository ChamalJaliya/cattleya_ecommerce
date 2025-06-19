export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface Address {
  id?: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Profile completion
  profileCompletion: number;
  
  // Preferences
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    language: string;
    currency: string;
    timezone: string;
  };
  
  // Addresses
  addresses: Address[];
  
  // Account details
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  
  // Admin specific fields
  permissions?: string[];
  department?: string;
  employeeId?: string;
  
  // Blocking system
  isBlocked: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Social links
  socialProfiles?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Customer specific
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
  customerSince?: Date;
} 