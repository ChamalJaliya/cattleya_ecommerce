import { Category } from '../entities/category.entity';

export interface CategoryFilters {
  isActive?: boolean;
  parentId?: string;
  searchQuery?: string;
}

export interface ICategoryRepository {
  // Basic CRUD operations
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByParentId(parentId: string | null): Promise<Category[]>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
  
  // Hierarchy operations
  findAll(filters?: CategoryFilters): Promise<Category[]>;
  findRootCategories(): Promise<Category[]>;
  findByParent(parentId: string): Promise<Category[]>;
  findWithChildren(id: string): Promise<Category | null>;
  findTree(): Promise<Category[]>;
  
  // Navigation and breadcrumbs
  getAncestors(id: string): Promise<Category[]>;
  getDescendants(id: string): Promise<Category[]>;
  getBreadcrumb(id: string): Promise<Category[]>;
  
  // Sorting and ordering
  updateSortOrder(id: string, sortOrder: number): Promise<Category>;
  reorderCategories(orders: { id: string; sortOrder: number }[]): Promise<void>;
  
  // Validation
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  hasProducts(id: string): Promise<boolean>;
  canDelete(id: string): Promise<boolean>;
  
  // Admin operations
  findActive(): Promise<Category[]>;
  findInactive(): Promise<Category[]>;
  activate(id: string): Promise<Category>;
  deactivate(id: string): Promise<Category>;
  
  // Search
  search(query: string): Promise<Category[]>;
  
  // Bulk operations
  createMany(categories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Category[]>;
  deleteMany(ids: string[]): Promise<void>;
  
  // New methods
  findCategoryTree(): Promise<Category[]>;
} 