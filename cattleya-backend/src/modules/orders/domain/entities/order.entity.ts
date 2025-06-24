export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  quantity: number;
  price: number;
  variantId?: string;
  variantName?: string;
  subtotal: number;
}

export interface OrderAddress {
  id?: string;
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
}

export interface CreateOrderProps {
  userId: string;
  number: string;
  email: string;
  phone?: string;
  shippingAddressId: string;
  billingAddressId: string;
  items: Omit<OrderItem, 'id' | 'orderId' | 'subtotal'>[];
  subtotal: number;
  taxAmount?: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  shippingMethod?: string;
  notes?: string;
  customerNotes?: string;
}

export interface UpdateOrderProps {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  paidAt?: Date;
  notes?: string;
  customerNotes?: string;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly number: string,
    public readonly status: OrderStatus,
    public readonly userId: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly shippingAddressId: string,
    public readonly billingAddressId: string,
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly shippingFee: number,
    public readonly discount: number,
    public readonly total: number,
    public readonly paymentStatus: PaymentStatus,
    public readonly paymentMethod: string | null,
    public readonly paidAt: Date | null,
    public readonly shippingMethod: string | null,
    public readonly trackingNumber: string | null,
    public readonly shippedAt: Date | null,
    public readonly deliveredAt: Date | null,
    public readonly notes: string | null,
    public readonly customerNotes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly items: OrderItem[] = [],
    public readonly shippingAddress?: OrderAddress,
    public readonly billingAddress?: OrderAddress,
    public readonly customer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    }
  ) {}

  static create(props: CreateOrderProps): Order {
    const now = new Date();
    
    return new Order(
      '', // Will be set by repository
      props.number,
      OrderStatus.PENDING,
      props.userId,
      props.email,
      props.phone || null,
      props.shippingAddressId,
      props.billingAddressId,
      props.subtotal,
      props.taxAmount || 0,
      props.shippingFee || 0,
      props.discount || 0,
      props.total,
      PaymentStatus.PENDING,
      props.paymentMethod || null,
      null, // paidAt
      props.shippingMethod || null,
      null, // trackingNumber
      null, // shippedAt
      null, // deliveredAt
      props.notes || null,
      props.customerNotes || null,
      now,
      now,
      props.items.map(item => ({
        ...item,
        subtotal: item.price * item.quantity
      }))
    );
  }

  update(props: UpdateOrderProps): Order {
    return new Order(
      this.id,
      this.number,
      props.status || this.status,
      this.userId,
      this.email,
      this.phone,
      this.shippingAddressId,
      this.billingAddressId,
      this.subtotal,
      this.taxAmount,
      this.shippingFee,
      this.discount,
      this.total,
      props.paymentStatus || this.paymentStatus,
      this.paymentMethod,
      props.paidAt || this.paidAt,
      this.shippingMethod,
      props.trackingNumber || this.trackingNumber,
      props.shippedAt || this.shippedAt,
      props.deliveredAt || this.deliveredAt,
      props.notes || this.notes,
      props.customerNotes || this.customerNotes,
      this.createdAt,
      new Date(),
      this.items,
      this.shippingAddress,
      this.billingAddress,
      this.customer
    );
  }

  get isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  get isShipped(): boolean {
    return this.status === OrderStatus.SHIPPED || this.status === OrderStatus.DELIVERED;
  }

  get isDelivered(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  get isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  get canBeCancelled(): boolean {
    return this.status === OrderStatus.PENDING || this.status === OrderStatus.CONFIRMED;
  }

  get canBeShipped(): boolean {
    return this.status === OrderStatus.CONFIRMED || this.status === OrderStatus.PROCESSING;
  }

  get canBeDelivered(): boolean {
    return this.status === OrderStatus.SHIPPED;
  }

  get customerFullName(): string {
    if (this.customer) {
      return `${this.customer.firstName} ${this.customer.lastName}`;
    }
    return 'Unknown Customer';
  }

  get itemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get formattedTotal(): string {
    return `$${this.total.toFixed(2)}`;
  }

  get formattedSubtotal(): string {
    return `$${this.subtotal.toFixed(2)}`;
  }

  get formattedTaxAmount(): string {
    return `$${this.taxAmount.toFixed(2)}`;
  }

  get formattedShippingFee(): string {
    return `$${this.shippingFee.toFixed(2)}`;
  }

  get formattedDiscount(): string {
    return `$${this.discount.toFixed(2)}`;
  }
} 