export interface CartRepositoryInterface {
  findByUserId(userId: string): Promise<any>;
  addItem(userId: string, data: any): Promise<any>;
  updateItem(userId: string, itemId: string, data: any): Promise<any>;
  removeItem(userId: string, itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
} 