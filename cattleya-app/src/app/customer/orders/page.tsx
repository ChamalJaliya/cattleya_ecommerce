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
  DocumentTextIcon
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
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orchid orders</p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.delivered}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.shipped}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.processing}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter Orders</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
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
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
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
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Shipping Information</h4>
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
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Method:</span> {order.payment.method}</p>
                      {order.payment.last4 && (
                        <p><span className="font-medium">Card:</span> **** **** **** {order.payment.last4}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 font-medium">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    {order.shipping.trackingNumber && (
                      <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                        <TruckIcon className="w-4 h-4 mr-2" />
                        Track Package
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {order.status === 'delivered' && (
                      <>
                        <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200">
                          <StarIcon className="w-4 h-4 mr-2" />
                          Write Review
                        </button>
                        <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200">
                          <ArrowPathIcon className="w-4 h-4 mr-2" />
                          Reorder
                        </button>
                      </>
                    )}
                    {order.status === 'shipped' && (
                      <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                        Contact Support
                      </button>
                    )}
                    <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Invoice
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet or no orders match your filter.</p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
} 