export class Wishlist {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    userId: string;
    productId: string;
  }): Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: data.userId,
      productId: data.productId,
    };
  }
} 