import { User } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockReason?: string;
}

export interface IUserRepository {
  create(userData: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }>;
} 