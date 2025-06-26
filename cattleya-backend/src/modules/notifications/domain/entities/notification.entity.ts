export enum NotificationType {
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  LOW_STOCK = 'LOW_STOCK',
  PROMOTION = 'PROMOTION',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  SUPPORT_REPLY = 'SUPPORT_REPLY',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification {
  private readonly props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get priority(): NotificationPriority {
    return this.props.priority;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  markAsRead(): void {
    this.props.isRead = true;
    this.props.updatedAt = new Date();
  }

  markAsUnread(): void {
    this.props.isRead = false;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  unarchive(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
  }

  isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() > this.props.expiresAt;
  }

  // Static factory methods
  static create(props: Omit<NotificationProps, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'>): Notification {
    return new Notification({
      ...props,
      id: '', // Will be set by repository
      isRead: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static createOrderConfirmation(userId: string, orderNumber: string, orderId: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.ORDER_CONFIRMATION,
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being processed.`,
      priority: NotificationPriority.MEDIUM,
      metadata: { orderId, orderNumber },
    });
  }

  static createOrderStatusUpdate(userId: string, orderNumber: string, orderId: string, status: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.ORDER_STATUS_UPDATE,
      title: 'Order Status Updated',
      message: `Your order #${orderNumber} status has been updated to: ${status}.`,
      priority: NotificationPriority.MEDIUM,
      metadata: { orderId, orderNumber, status },
    });
  }

  static createOrderShipped(userId: string, orderNumber: string, orderId: string, trackingNumber?: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.ORDER_SHIPPED,
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      priority: NotificationPriority.HIGH,
      metadata: { orderId, orderNumber, trackingNumber },
    });
  }

  static createOrderDelivered(userId: string, orderNumber: string, orderId: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.ORDER_DELIVERED,
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered!`,
      priority: NotificationPriority.HIGH,
      metadata: { orderId, orderNumber },
    });
  }

  static createPaymentSuccess(userId: string, orderNumber: string, orderId: string, amount: number): Notification {
    return Notification.create({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Payment Successful',
      message: `Payment of $${amount.toFixed(2)} for order #${orderNumber} was successful.`,
      priority: NotificationPriority.MEDIUM,
      metadata: { orderId, orderNumber, amount },
    });
  }

  static createPaymentFailed(userId: string, orderNumber: string, orderId: string, amount: number): Notification {
    return Notification.create({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: `Payment of $${amount.toFixed(2)} for order #${orderNumber} failed. Please try again.`,
      priority: NotificationPriority.HIGH,
      metadata: { orderId, orderNumber, amount },
    });
  }

  static createLowStock(userId: string, productName: string, productId: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock. Order soon to avoid disappointment!`,
      priority: NotificationPriority.MEDIUM,
      metadata: { productId, productName },
    });
  }

  static createPromotion(userId: string, title: string, message: string, promotionId: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.PROMOTION,
      title,
      message,
      priority: NotificationPriority.LOW,
      metadata: { promotionId },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  static createSystemAlert(userId: string, title: string, message: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      priority: NotificationPriority.HIGH,
    });
  }

  static createSupportReply(userId: string, ticketId: string, ticketNumber: string): Notification {
    return Notification.create({
      userId,
      type: NotificationType.SUPPORT_REPLY,
      title: 'Support Reply',
      message: `You have received a reply to your support ticket #${ticketNumber}.`,
      priority: NotificationPriority.MEDIUM,
      metadata: { ticketId, ticketNumber },
    });
  }
} 