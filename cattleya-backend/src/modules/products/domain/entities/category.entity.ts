export interface CreateCategoryProps {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export class Category {
  // Navigation properties (these will be populated by the repository)
  public parent?: Category | null;
  public children?: Category[];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly icon: string | null,
    public readonly parentId: string | null,
    public isActive: boolean,
    public sortOrder: number,
    public readonly seoTitle: string | null,
    public readonly seoDescription: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateName();
    this.validateSlug();
  }

  static create(props: CreateCategoryProps): Category {
    const now = new Date();
    
    return new Category(
      '', // Will be set by repository
      props.name,
      props.slug,
      props.description || null,
      props.icon || null,
      props.parentId || null,
      props.isActive !== false,
      props.sortOrder || 0,
      props.metaTitle || null,
      props.metaDescription || null,
      now,
      now,
    );
  }

  get isRoot(): boolean {
    return this.parentId === null;
  }

  get hasParent(): boolean {
    return this.parentId !== null;
  }

  // Business logic methods
  public get isRootCategory(): boolean {
    return !this.parentId;
  }

  public get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  public get depth(): number {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  public get fullPath(): string {
    const path: string[] = [];
    let current: Category | undefined = this;
    
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    
    return path.join(' > ');
  }

  public generateSlug(): string {
    return this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  public addChild(child: Category): void {
    if (!this.children) {
      this.children = [];
    }
    
    child.parent = this;
    this.children.push(child);
  }

  public removeChild(childId: string): void {
    if (this.children) {
      this.children = this.children.filter(child => child.id !== childId);
    }
  }

  public getAllDescendants(): Category[] {
    const descendants: Category[] = [];
    
    if (this.children) {
      for (const child of this.children) {
        descendants.push(child);
        descendants.push(...child.getAllDescendants());
      }
    }
    
    return descendants;
  }

  public getAncestors(): Category[] {
    const ancestors: Category[] = [];
    let current = this.parent;
    
    while (current) {
      ancestors.unshift(current);
      current = current.parent;
    }
    
    return ancestors;
  }

  public getDepth(): number {
    return this.getAncestors().length;
  }

  public getPath(): string {
    const ancestors = this.getAncestors();
    let current = this.parent;
    const pathParts: string[] = [];
    
    while (current) {
      pathParts.unshift(current.slug);
      current = current.parent;
    }
    
    pathParts.push(this.slug);
    return pathParts.join('/');
  }

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
    if (this.children) {
      this.children.forEach(child => child.deactivate());
    }
  }

  public updateSortOrder(order: number): void {
    this.sortOrder = order;
  }

  private validateName(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    if (this.name.length > 100) {
      throw new Error('Category name cannot exceed 100 characters');
    }
  }

  private validateSlug(): void {
    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error('Category slug cannot be empty');
    }
    if (!/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error('Category slug can only contain lowercase letters, numbers, and hyphens');
    }
  }

  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Category name is required');
    }

    if (!this.slug || this.slug.trim().length === 0) {
      errors.push('Category slug is required');
    }

    if (this.parentId === this.id) {
      errors.push('Category cannot be its own parent');
    }

    if (this.sortOrder < 0) {
      errors.push('Sort order cannot be negative');
    }

    return { isValid: errors.length === 0, errors };
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      icon: this.icon,
      parentId: this.parentId,
      parent: this.parent ? {
        id: this.parent.id,
        name: this.parent.name,
        slug: this.parent.slug
      } : undefined,
      children: this.children?.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        sortOrder: child.sortOrder,
        isActive: child.isActive
      })),
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription,
      isRootCategory: this.isRootCategory,
      hasChildren: this.hasChildren,
      depth: this.depth,
      fullPath: this.fullPath,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 