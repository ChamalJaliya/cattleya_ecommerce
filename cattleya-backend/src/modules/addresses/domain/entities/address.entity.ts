export interface Address {
  id?: string;
  userId: string;
  type: 'shipping' | 'billing';
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 