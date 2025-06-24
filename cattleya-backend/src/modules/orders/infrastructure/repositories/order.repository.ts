import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma/prisma.service';
import { IOrderRepository, OrderQueryOptions, OrderStats } from '../../domain/repositories/order.repository.interface';
import { Order, OrderStatus, PaymentStatus, OrderItem, OrderAddress } from '../../domain/entities/order.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        number: order.number,
        status: order.status,
        userId: order.userId,
        email: order.email,
        phone: order.phone,
        shippingAddressId: order.shippingAddressId,
        billingAddressId: order.billingAddressId,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        notes: order.notes,
        customerNotes: order.customerNotes,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId,
            variantName: item.variantName,
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return order ? this.mapToEntity(order) : null;
  }

  async findByNumber(number: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return order ? this.mapToEntity(order) : null;
  }

  async findAll(options: OrderQueryOptions = {}): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total count
    const total = await this.prisma.order.count({ where });

    // Get orders
    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.mapToEntity(order)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async update(id: string, order: Order): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        notes: order.notes,
        customerNotes: order.customerNotes,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        paymentStatus,
        paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : null
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async addTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { trackingNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async markAsShipped(id: string, trackingNumber?: string): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
        trackingNumber: trackingNumber || undefined
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async markAsDelivered(id: string): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async markAsPaid(id: string): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.CANCELLED,
        notes: reason ? `${reason}\n${new Date().toISOString()}` : undefined
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return this.mapToEntity(updated);
  }

  async findByUserId(userId: string, options: OrderQueryOptions = {}): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.findAll({ ...options, userId });
  }

  async getStats(startDate?: Date, endDate?: Date): Promise<OrderStats> {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      pendingPaymentOrders
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true }
      }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PROCESSING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      this.prisma.order.count({ where: { ...where, paymentStatus: PaymentStatus.PAID } }),
      this.prisma.order.count({ where: { ...where, paymentStatus: PaymentStatus.PENDING } })
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      pendingPaymentOrders
    };
  }

  async getRevenueStats(startDate?: Date, endDate?: Date): Promise<{ date: string; revenue: number; orders: number }[]> {
    const where: any = { paymentStatus: PaymentStatus.PAID };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const stats = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where,
      _sum: { total: true },
      _count: { id: true }
    });

    return stats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      revenue: stat._sum.total || 0,
      orders: stat._count.id
    }));
  }

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return orders.map(order => this.mapToEntity(order));
  }

  private mapToEntity(data: any): Order {
    const items: OrderItem[] = data.items?.map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images?.[0]?.url,
      quantity: item.quantity,
      price: item.price,
      variantId: item.variantId,
      variantName: item.variantName,
      subtotal: item.price * item.quantity,
    })) || [];

    const shippingAddress: OrderAddress | undefined = data.shippingAddress ? {
      id: data.shippingAddress.id,
      type: 'shipping',
      label: data.shippingAddress.label,
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      company: data.shippingAddress.company,
      street: data.shippingAddress.street,
      apartment: data.shippingAddress.apartment,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zipCode: data.shippingAddress.zipCode,
      country: data.shippingAddress.country,
      phone: data.shippingAddress.phone,
    } : undefined;

    const billingAddress: OrderAddress | undefined = data.billingAddress ? {
      id: data.billingAddress.id,
      type: 'billing',
      label: data.billingAddress.label,
      firstName: data.billingAddress.firstName,
      lastName: data.billingAddress.lastName,
      company: data.billingAddress.company,
      street: data.billingAddress.street,
      apartment: data.billingAddress.apartment,
      city: data.billingAddress.city,
      state: data.billingAddress.state,
      zipCode: data.billingAddress.zipCode,
      country: data.billingAddress.country,
      phone: data.billingAddress.phone,
    } : undefined;

    const customer = data.user ? {
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      avatar: data.user.avatar,
    } : undefined;

    return new Order(
      data.id,
      data.number,
      data.status,
      data.userId,
      data.email,
      data.phone,
      data.shippingAddressId,
      data.billingAddressId,
      data.subtotal,
      data.taxAmount,
      data.shippingFee,
      data.discount,
      data.total,
      data.paymentStatus,
      data.paymentMethod,
      data.paidAt,
      data.shippingMethod,
      data.trackingNumber,
      data.shippedAt,
      data.deliveredAt,
      data.notes,
      data.customerNotes,
      data.createdAt,
      data.updatedAt,
      items,
      shippingAddress,
      billingAddress,
      customer
    );
  }
} 