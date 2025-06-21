'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock customer orders data
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 149.99,
    items: [
      {
        id: '1',
        name: 'Cattleya Orchid Premium',
        image: '🌺',
        quantity: 1,
        price: 149.99,
        reviewed: true,
        rating: 5
      }
    ],
    shipping: {
      method: 'Standard Shipping',
      address: '123 Garden St, New York, NY 10001',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-01-18',
      actualDelivery: '2024-01-17'
    },
    payment: {
      method: 'Credit Card',
      last4: '4242'
    }
  },
  {
    id: 'ORD-002',
    date: '2024-01-12',
    status: 'shipped',
    total: 139.97,
    items: [
      {
        id: '2',
        name: 'Orchid Care Kit',
        image: '🧴',
        quantity: 1,
        price: 89.99,
        reviewed: false,
        rating: 0
      },
      {
        id: '3',
        name: 'Premium Potting Mix',
        image: '🏺',
        quantity: 2,
        price: 24.99,
        reviewed: false,
        rating: 0
      }
    ],
    shipping: {
      method: 'Express Shipping',
      address: '123 Garden St, New York, NY 10001',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-01-14',
      actualDelivery: null
    },
    payment: {
      method: 'PayPal',
      last4: null
    }
  },
  {
    id: 'ORD-003',
    date: '2024-01-10',
    status: 'processing',
    total: 299.99,
    items: [
      {
        id: '4',
        name: 'Rare Cattleya Collection',
        image: '🌸',
        quantity: 1,
        price: 299.99,
        reviewed: false,
        rating: 0
      }
    ],
    shipping: {
      method: 'Standard Shipping',
      address: '123 Garden St, New York, NY 10001',
      trackingNumber: null,
      estimatedDelivery: '2024-01-15',
      actualDelivery: null
    },
    payment: {
      method: 'Credit Card',
      last4: '4242'
    }
  },
  {
    id: 'ORD-004',
    date: '2024-01-08',
    status: 'cancelled',
    total: 79.99,
    items: [
      {
        id: '5',
        name: 'Beginner Orchid Set',
        image: '🌱',
        quantity: 1,
        price: 79.99,
        reviewed: false,
        rating: 0
      }
    ],
    shipping: {
      method: 'Standard Shipping',
      address: '123 Garden St, New York, NY 10001',
      trackingNumber: null,
      estimatedDelivery: null,
      actualDelivery: null
    },
    payment: {
      method: 'Credit Card',
      last4: '4242'
    }
  }
];

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredOrders = orders.filter(order => 
    selectedStatus === 'all' || order.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const orderStats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    processing: orders.filter(o => o.status === 'processing').length
  };

  const stats = [
    {
      name: 'Total Orders',
      value: orderStats.total,
      icon: ShoppingBagIcon,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'All time orders'
    },
    {
      name: 'Delivered',
      value: orderStats.delivered,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Successfully delivered'
    },
    {
      name: 'Shipped',
      value: orderStats.shipped,
      icon: TruckIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'In transit'
    },
    {
      name: 'Processing',
      value: orderStats.processing,
      icon: ClockIcon,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      description: 'Being prepared'
    }
  ];

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
                Track and manage your orchid orders
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                      {stat.value}
                    </p>
                    <span className="text-xs text-gray-500">{stat.description}</span>
                  </div>
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Filter */}
        <div className="group relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filter Orders</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
              >
                <option value="all">All Orders</option>
                <option value="delivered">Delivered</option>
                <option value="shipped">Shipped</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                          {item.image}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                          {item.reviewed && item.rating && (
                            <div className="flex items-center mt-1">
                              {[...Array(item.rating)].map((_, i) => (
                                <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6 bg-gradient-to-r from-gray-50/50 to-purple-50/30 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <TruckIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Shipping Information
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Method:</span> {order.shipping.method}</p>
                        <p><span className="font-medium">Address:</span> {order.shipping.address}</p>
                        {order.shipping.trackingNumber && (
                          <p><span className="font-medium">Tracking:</span> {order.shipping.trackingNumber}</p>
                        )}
                        {order.shipping.estimatedDelivery && (
                          <p><span className="font-medium">Estimated Delivery:</span> {order.shipping.estimatedDelivery}</p>
                        )}
                        {order.shipping.actualDelivery && (
                          <p><span className="font-medium">Delivered On:</span> {order.shipping.actualDelivery}</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Payment Information
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Method:</span> {order.payment.method}</p>
                        {order.payment.last4 && (
                          <p><span className="font-medium">Card:</span> **** **** **** {order.payment.last4}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center space-x-3">
                      <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                        <div className="relative flex items-center">
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </div>
                      </button>
                      {order.shipping.trackingNumber && (
                        <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                          <div className="relative flex items-center">
                            <TruckIcon className="w-4 h-4 mr-2" />
                            Track Package
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {order.status === 'delivered' && (
                        <>
                          <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-200 font-semibold">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                            <div className="relative flex items-center">
                              <StarIcon className="w-4 h-4 mr-2" />
                              Write Review
                            </div>
                          </button>
                          <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-200 font-semibold">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                            <div className="relative flex items-center">
                              <ArrowPathIcon className="w-4 h-4 mr-2" />
                              Reorder
                            </div>
                          </button>
                        </>
                      )}
                      {order.status === 'shipped' && (
                        <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-xl hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 font-semibold">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                          <div className="relative flex items-center">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                            Contact Support
                          </div>
                        </button>
                      )}
                      <button className="group/btn relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-xl hover:from-gray-200 hover:to-slate-200 transition-all duration-200 font-semibold">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                        <div className="relative flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Invoice
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet or no orders match your filter.</p>
            <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative">Start Shopping</div>
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
} 