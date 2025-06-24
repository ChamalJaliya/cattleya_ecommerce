export class CartEntity {
  id: string;
  userId: string;
  items: any[]; // Will be CartItemEntity[]
  createdAt: Date;
  updatedAt: Date;
} 