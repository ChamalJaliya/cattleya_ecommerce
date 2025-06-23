'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  CreditCardIcon,
  MapPinIcon,
  HashtagIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: {
      name: 'John Smith',
      email: 'john@example.com',
      avatar: 'JS'
    },
    items: [
      { name: 'Cattleya Orchid Premium', quantity: 1, price: 149.99 }
    ],
    total: 149.99,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '123 Garden St, New York, NY 10001',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    trackingNumber: 'TRK123456789'
  },
  {
    id: 'ORD-002',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'SJ'
    },
    items: [
      { name: 'Orchid Care Kit', quantity: 1, price: 89.99 },
      { name: 'Premium Potting Mix', quantity: 2, price: 24.99 }
    ],
    total: 139.97,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '456 Bloom Ave, Los Angeles, CA 90210',
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-17',
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'ORD-003',
    customer: {
      name: 'Mike Wilson',
      email: 'mike@example.com',
      avatar: 'MW'
    },
    items: [
      { name: 'Rare Cattleya Collection', quantity: 1, price: 299.99 }
    ],
    total: 299.99,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: '789 Flower Rd, Miami, FL 33101',
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-16',
    trackingNumber: null
  },
  {
    id: 'ORD-004',
    customer: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: 'ED'
    },
    items: [
      { name: 'Beginner Orchid Set', quantity: 1, price: 79.99 },
      { name: 'Orchid Fertilizer Pro', quantity: 1, price: 29.99 }
    ],
    total: 109.98,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '321 Plant St, Seattle, WA 98101',
    orderDate: '2024-01-12',
    deliveryDate: null,
    trackingNumber: null
  },
  {
    id: 'ORD-005',
    customer: {
      name: 'Robert Brown',
      email: 'robert@example.com',
      avatar: 'RB'
    },
    items: [
      { name: 'Cattleya Orchid Premium', quantity: 2, price: 149.99 }
    ],
    total: 299.98,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: '654 Garden Way, Chicago, IL 60601',
    orderDate: '2024-01-11',
    deliveryDate: null,
    trackingNumber: null
  }
];

const statusOptions = ['All Status', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['All Payment', 'pending', 'paid', 'refunded'];

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All Payment');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 12;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'All Payment' || order.paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPaymentStatus]);

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  const statsData = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Total paid orders'
    },
    {
      name: 'Pending Orders',
      value: pendingOrders.toString(),
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: ClockIcon,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      iconBg: 'from-orange-400 to-amber-600',
      glowColor: 'shadow-orange-500/30',
      description: 'Awaiting processing'
    },
    {
      name: 'Processing',
      value: processingOrders.toString(),
      change: '+5.1%',
      changeType: 'increase' as const,
      icon: BoltIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Currently processing'
    },
    {
      name: 'Shipped Orders',
      value: shippedOrders.toString(),
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: TruckIcon,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      iconBg: 'from-purple-400 to-violet-600',
      glowColor: 'shadow-purple-500/30',
      description: 'Orders in transit'
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                  Orders Management
                </h1>
                <p className="text-gray-600 text-lg">Track and manage customer orders with ease</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Orders Dashboard Overview
                  </span>
                </div>
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    View All Orders
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                        <div className="ml-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {stat.changeType === 'increase' ? (
                            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                              <ArrowUpIcon className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-xs font-bold text-green-700">{stat.change}</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
                              <ArrowDownIcon className="w-3 h-3 text-red-600 mr-1" />
                              <span className="text-xs font-bold text-red-700">{stat.change}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">vs last month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders, customers, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <TableCellsIcon className="w-4 h-4 mr-1" />
                      Table
                    </button>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                      <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Order Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Payment Status</label>
                        <select
                          value={selectedPaymentStatus}
                          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        >
                          {paymentStatusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Enhanced Orders Display */}
          <div className="min-h-[600px]">
            {viewMode === 'cards' ? (
              /* Card View */
              <div className="space-y-6 min-h-[600px]">
              {paginatedOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Order Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center font-bold text-purple-700 group-hover:scale-110 transition-transform duration-200">
                          {order.customer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                              <CreditCardIcon className="w-3 h-3 mr-1" />
                              <span className="capitalize">{order.paymentStatus}</span>
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-xs text-gray-600">{order.customer.email}</p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Order Date</p>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {order.orderDate}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>

                        {order.trackingNumber && (
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Tracking</p>
                            <div className="flex items-center text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                              <HashtagIcon className="w-4 h-4 mr-1" />
                              {order.trackingNumber}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button className="group/action relative overflow-hidden">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                          <div className="relative p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        </button>
                        
                        <button className="group/action relative overflow-hidden">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                          <div className="relative p-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                            <PencilIcon className="w-5 h-5" />
                          </div>
                        </button>

                        <button className="group/action relative overflow-hidden">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                          <div className="relative p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                            <PrinterIcon className="w-5 h-5" />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShoppingBagIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Order Items:</span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-900">{item.name}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-600">Qty: {item.quantity}</span>
                              <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start space-x-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Shipping Address:</span>
                          <p className="text-sm text-gray-600 mt-1">{order.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Table View */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                                  <div className="overflow-x-auto hide-scrollbar">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {paginatedOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="hover:bg-purple-50/50 transition-colors duration-200 group/row"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center font-bold text-purple-700 text-sm group-hover/row:scale-110 transition-transform duration-200">
                                {order.customer.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{order.id}</div>
                                {order.trackingNumber && (
                                  <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                                    <HashtagIcon className="w-3 h-3 mr-1" />
                                    {order.trackingNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                              <div className="text-sm text-gray-500">{order.customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="mb-1 last:mb-0">
                                  <span className="font-medium">{item.quantity}x</span> {item.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  <CreditCardIcon className="w-3 h-3 mr-1" />
                                  <span className="capitalize">{order.paymentStatus}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ${order.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-400" />
                              {order.orderDate}
                            </div>
                            {order.deliveryDate && (
                              <div className="text-sm text-gray-500 mt-1">
                                Delivery: {order.deliveryDate}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button className="group/action relative overflow-hidden">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                <div className="relative p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                  <EyeIcon className="w-4 h-4" />
                                </div>
                              </button>
                              
                              <button className="group/action relative overflow-hidden">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                <div className="relative p-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                  <PencilIcon className="w-4 h-4" />
                                </div>
                              </button>

                              <button className="group/action relative overflow-hidden">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                <div className="relative p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                  <PrinterIcon className="w-4 h-4" />
                                </div>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && filteredOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between mt-8"
            >
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing</span>
                <span className="font-medium text-gray-900">
                  {Math.min(startIndex + 1, filteredOrders.length)}
                </span>
                <span>to</span>
                <span className="font-medium text-gray-900">
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)}
                </span>
                <span>of</span>
                <span className="font-medium text-gray-900">{filteredOrders.length}</span>
                <span>orders</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 group-hover:scale-105 disabled:hover:scale-100">
                    Previous
                  </div>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`group relative overflow-hidden w-10 h-10 rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
                      }`}
                    >
                      <span className="relative z-10">{page}</span>
                      {currentPage === page && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20"></div>
                      )}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 group-hover:scale-105 disabled:hover:scale-100">
                    Next
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Enhanced Empty State */}
          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 