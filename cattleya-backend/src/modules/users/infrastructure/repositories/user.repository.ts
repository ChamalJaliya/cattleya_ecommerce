import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserData): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        role: userData.role as any,
        phone: userData.phone,
      },
    });

    return User.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      password: prismaUser.password,
      role: prismaUser.role as UserRole,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      isBlocked: prismaUser.isBlocked,
      blockedAt: prismaUser.blockedAt,
      blockedBy: prismaUser.blockedBy,
      blockReason: prismaUser.blockReason,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) return null;

    return User.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      password: prismaUser.password,
      role: prismaUser.role as UserRole,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      isBlocked: prismaUser.isBlocked,
      blockedAt: prismaUser.blockedAt,
      blockedBy: prismaUser.blockedBy,
      blockReason: prismaUser.blockReason,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) return null;

    return User.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      password: prismaUser.password,
      role: prismaUser.role as UserRole,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      isBlocked: prismaUser.isBlocked,
      blockedAt: prismaUser.blockedAt,
      blockedBy: prismaUser.blockedBy,
      blockReason: prismaUser.blockReason,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    return User.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      password: prismaUser.password,
      role: prismaUser.role as UserRole,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      isBlocked: prismaUser.isBlocked,
      blockedAt: prismaUser.blockedAt,
      blockedBy: prismaUser.blockedBy,
      blockReason: prismaUser.blockReason,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(page: number, limit: number): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [prismaUsers, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const users = prismaUsers.map(prismaUser =>
      User.fromPersistence({
        id: prismaUser.id,
        email: prismaUser.email,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        password: prismaUser.password,
        role: prismaUser.role as UserRole,
        phone: prismaUser.phone,
        avatar: prismaUser.avatar,
        isBlocked: prismaUser.isBlocked,
        blockedAt: prismaUser.blockedAt,
        blockedBy: prismaUser.blockedBy,
        blockReason: prismaUser.blockReason,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      })
    );

    return {
      users,
      total,
      page,
      limit,
    };
  }
} 