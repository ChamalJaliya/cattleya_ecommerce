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
        image: category.imageUrl,
        parentId: category.parentId,
        metaTitle: category.seoTitle,
        metaDescription: category.seoDescription,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      },
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
        image: category.imageUrl,
        parentId: category.parentId,
        metaTitle: category.seoTitle,
        metaDescription: category.seoDescription,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      },
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
    // Check if category has children
    const children = await this.prisma.category.findMany({
      where: { parentId: id }
    });

    if (children.length > 0) {
      throw new Error('Cannot delete category with children. Please move or delete children first.');
    }

    // Check if category has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      throw new Error('Cannot delete category with products. Please move products to another category first.');
    }

    await this.prisma.category.delete({
      where: { id }
    });
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
    const [hasChildren, hasProducts] = await Promise.all([
      this.prisma.category.count({ where: { parentId: id } }),
      this.prisma.product.count({ where: { categoryId: id } })
    ]);

    return hasChildren === 0 && hasProducts === 0;
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
    const created = await this.prisma.category.createMany({
      data: categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.imageUrl,
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
    return new Category(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.image,
      data.parentId,
      data.isActive,
      data.sortOrder,
      data.metaTitle,
      data.metaDescription,
      data.createdAt,
      data.updatedAt
    );
  }
} 