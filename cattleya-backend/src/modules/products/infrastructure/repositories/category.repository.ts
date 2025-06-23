import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { Category } from '../../domain/entities/category.entity';
import { ICategoryRepository, CategoryFilters } from '../../domain/repositories/category.repository.interface';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        parentId: category.parentId,
        metaTitle: category.seoTitle,
        metaDescription: category.seoDescription,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      } as any,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return category ? this.mapToEntity(category) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return category ? this.mapToEntity(category) : null;
  }

  async findAll(filters?: CategoryFilters): Promise<Category[]> {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    if (filters?.searchQuery) {
      where.OR = [
        { name: { contains: filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: filters.searchQuery, mode: 'insensitive' } },
        { slug: { contains: filters.searchQuery, mode: 'insensitive' } }
      ];
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        parentId: category.parentId,
        metaTitle: category.seoTitle,
        metaDescription: category.seoDescription,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      } as any,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    // Check if category has products (we still want to prevent deletion if it has products)
    const productCount = await this.prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      throw new Error('Cannot delete category with products. Please move products to another category first.');
    }

    // Recursively delete all children first (cascade delete)
    await this.deleteChildrenRecursively(id);

    // Now delete the parent category
    await this.prisma.category.delete({
      where: { id }
    });
  }

  private async deleteChildrenRecursively(parentId: string): Promise<void> {
    // Find all children of this category
    const children = await this.prisma.category.findMany({
      where: { parentId }
    });

    // Recursively delete each child and their children
    for (const child of children) {
      await this.deleteChildrenRecursively(child.id);
      await this.prisma.category.delete({
        where: { id: child.id }
      });
    }
  }

  async findRootCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async findByParent(parentId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async findWithChildren(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            _count: {
              select: { products: true }
            }
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return category ? this.mapToEntity(category) : null;
  }

  async findTree(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                _count: {
                  select: { products: true }
                }
              },
              orderBy: [
                { sortOrder: 'asc' },
                { name: 'asc' }
              ]
            },
            _count: {
              select: { products: true }
            }
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async getAncestors(id: string): Promise<Category[]> {
    const ancestors: Category[] = [];
    let currentId = id;

    while (currentId) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentId },
        include: {
          parent: true,
          _count: {
            select: { products: true }
          }
        }
      });

      if (!category) break;

      if (category.parent) {
        ancestors.unshift(this.mapToEntity(category.parent));
        currentId = category.parent.id;
      } else {
        break;
      }
    }

    return ancestors;
  }

  async getDescendants(id: string): Promise<Category[]> {
    const descendants: Category[] = [];
    
    const getChildren = async (parentId: string) => {
      const children = await this.prisma.category.findMany({
        where: { parentId },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      for (const child of children) {
        descendants.push(this.mapToEntity(child));
        await getChildren(child.id);
      }
    };

    await getChildren(id);
    return descendants;
  }

  async getBreadcrumb(id: string): Promise<Category[]> {
    const ancestors = await this.getAncestors(id);
    const current = await this.findById(id);
    
    if (current) {
      return [...ancestors, current];
    }
    
    return ancestors;
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: { sortOrder },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async reorderCategories(orders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const order of orders) {
      await this.prisma.category.update({
        where: { id: order.id },
        data: { sortOrder: order.sortOrder }
      });
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await this.prisma.category.count({ where });
    return count > 0;
  }

  async hasProducts(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id }
    });
    return count > 0;
  }

  async canDelete(id: string): Promise<boolean> {
    const hasProducts = await this.prisma.product.count({
      where: { categoryId: id }
    });

    return hasProducts === 0;
  }

  async findActive(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async findInactive(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: false },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async activate(id: string): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: true },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async deactivate(id: string): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async search(query: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(cat => this.mapToEntity(cat));
  }

  async createMany(categories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Category[]> {
    const createdCategories = await this.prisma.category.createMany({
      data: categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parentId,
        metaTitle: cat.seoTitle,
        metaDescription: cat.seoDescription,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      }))
    });

    // Return the created categories
    return this.findAll();
  }

  async deleteMany(ids: string[]): Promise<void> {
    // Check if any category has children or products
    for (const id of ids) {
      const canDelete = await this.canDelete(id);
      if (!canDelete) {
        throw new Error(`Cannot delete category ${id} - it has children or products`);
      }
    }

    await this.prisma.category.deleteMany({
      where: { id: { in: ids } }
    });
  }

  async findCategoryTree(): Promise<Category[]> {
    return this.findTree();
  }

  private mapToEntity(data: any): Category {
    if (!data) return null;
    const entity = new Category(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.icon,
      data.parentId,
      data.isActive,
      data.sortOrder,
      data.metaTitle,
      data.metaDescription,
      data.createdAt,
      data.updatedAt
    );
    
    // Preserve parent relationship if it exists
    if (data.parent) {
      entity.parent = this.mapToEntity(data.parent);
    }
    
    // Preserve children relationships if they exist
    if (data.children && Array.isArray(data.children)) {
      entity.children = data.children.map(child => this.mapToEntity(child));
    }
    
    return entity;
  }
} 