'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { UserRole } from '@/core/domain/entities/User';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

// This is a test comment to check if file editing is working.

// Mock data for admin dashboard
const dashboardStats = [
  {
    name: 'Total Revenue',
    value: '$45,231',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    color: 'from-emerald-500 via-green-500 to-teal-500',
    iconBg: 'from-emerald-400 to-green-600',
    glowColor: 'shadow-emerald-500/30',
    description: 'Monthly revenue growth'
  },
  {
    name: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: ClipboardDocumentListIcon,
    color: 'from-blue-500 via-cyan-500 to-sky-500',
    iconBg: 'from-blue-400 to-cyan-600',
    glowColor: 'shadow-blue-500/30',
    description: 'Orders processed'
  },
  {
    name: 'Active Customers',
    value: '892',
    change: '+5.1%',
    changeType: 'increase' as const,
    icon: UsersIcon,
    color: 'from-purple-500 via-violet-500 to-indigo-500',
    iconBg: 'from-purple-400 to-violet-600',
    glowColor: 'shadow-purple-500/30',
    description: 'Customer base expansion'
  },
  {
    name: 'Products in Stock',
    value: '456',
    change: '-2.3%',
    changeType: 'decrease' as const,
    icon: ShoppingBagIcon,
    color: 'from-orange-500 via-red-500 to-pink-500',
    iconBg: 'from-orange-400 to-red-600',
    glowColor: 'shadow-orange-500/30',
    description: 'Inventory management'
  }
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Smith',
    product: 'Cattleya Orchid Premium',
    amount: '$149.99',
    status: 'completed',
    date: '2024-01-15',
    avatar: '👨‍💼'
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Johnson',
    product: 'Orchid Care Kit',
    amount: '$89.99',
    status: 'processing',
    date: '2024-01-15',
    avatar: '👩‍💼'
  },
  {
    id: 'ORD-003',
    customer: 'Mike Wilson',
    product: 'Rare Cattleya Collection',
    amount: '$299.99',
    status: 'shipped',
    date: '2024-01-14',
    avatar: '🧑‍💼'
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    product: 'Beginner Orchid Set',
    amount: '$79.99',
    status: 'pending',
    date: '2024-01-14',
    avatar: '👩‍🔬'
  }
];

const topProducts = [
  {
    name: 'Cattleya Orchid Premium',
    sales: 156,
    revenue: '$23,400',
    image: '🌺',
    trend: '+15%',
    rank: 1
  },
  {
    name: 'Orchid Care Kit',
    sales: 134,
    revenue: '$12,060',
    image: '🧴',
    trend: '+12%',
    rank: 2
  },
  {
    name: 'Rare Cattleya Collection',
    sales: 89,
    revenue: '$26,700',
    image: '🌸',
    trend: '+8%',
    rank: 3
  },
  {
    name: 'Beginner Orchid Set',
    sales: 67,
    revenue: '$5,360',
    image: '🌱',
    trend: '+5%',
    rank: 4
  }
];

const quickActions = [
  {
    label: 'Add Product',
    icon: PlusIcon,
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    href: '/admin/products/add',
    description: 'Create new product'
  },
  {
    label: 'View Orders',
    icon: ClipboardDocumentListIcon,
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    href: '/admin/orders',
    description: 'Manage orders'
  },
  {
    label: 'Manage Users',
    icon: UsersIcon,
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    href: '/admin/customers',
    description: 'User management'
  },
  {
    label: 'View Analytics',
    icon: ChartBarIcon,
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    href: '/admin/analytics',
    description: 'Performance insights'
  }
];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Welcome Header */}
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
                  Welcome back, {user?.firstName}! 
                  <span className="ml-2 text-3xl">👋</span>
                </h1>
                <p className="text-gray-600 text-lg">
                  Here&apos;s what&apos;s happening with your orchid business today.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  Dashboard Overview
                </span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Enhanced Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                        <p className="text-sm text-gray-600">Latest customer transactions</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors duration-200">
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 group/item"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform duration-200">
                            {order.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-bold text-gray-900">{order.id}</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                            <p className="text-xs text-gray-600">{order.product}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {order.amount}
                          </p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Top Products */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <TrophyIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
                        <p className="text-sm text-gray-600">Best performing items</p>
                      </div>
                    </div>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors duration-200">
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <motion.div 
                        key={product.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group/item"
                      >
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl group-hover/item:scale-110 transition-transform duration-200">
                            {product.image}
                          </div>
                          <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            product.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            product.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            product.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                            'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}>
                            {product.rank}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">{product.name}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">{product.sales} sales</p>
                            <div className="flex items-center bg-green-100 px-2 py-0.5 rounded-full">
                              <ArrowUpIcon className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-xs font-bold text-green-700">{product.trend}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {product.revenue}
                          </p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Frequently used admin tools</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="group/action relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                    <div className={`relative flex flex-col items-center justify-center p-6 bg-gradient-to-r ${action.gradient} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover/action:scale-105 group-hover/action:-translate-y-1`}>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover/action:scale-110 transition-transform duration-300">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{action.label}</h4>
                      <p className="text-xs text-white/80 text-center">{action.description}</p>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Enhanced System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-200/50 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FireIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                      System Status: All Systems Operational
                    </h3>
                    <p className="text-green-700 mt-1">
                      All services are running smoothly. Last updated: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    100% Uptime
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
} 