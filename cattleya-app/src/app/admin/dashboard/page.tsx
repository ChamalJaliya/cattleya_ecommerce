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
  EyeIcon,
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { UserRole } from '@/core/domain/entities/User';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

// Mock data for admin dashboard
const dashboardStats = [
  {
    name: 'Total Revenue',
    value: '$45,231',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: ClipboardDocumentListIcon,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Active Customers',
    value: '892',
    change: '+5.1%',
    changeType: 'increase' as const,
    icon: UsersIcon,
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Products in Stock',
    value: '456',
    change: '-2.3%',
    changeType: 'decrease' as const,
    icon: ShoppingBagIcon,
    color: 'from-orange-500 to-red-500'
  }
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Smith',
    product: 'Cattleya Orchid Premium',
    amount: '$149.99',
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Johnson',
    product: 'Orchid Care Kit',
    amount: '$89.99',
    status: 'processing',
    date: '2024-01-15'
  },
  {
    id: 'ORD-003',
    customer: 'Mike Wilson',
    product: 'Rare Cattleya Collection',
    amount: '$299.99',
    status: 'shipped',
    date: '2024-01-14'
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    product: 'Beginner Orchid Set',
    amount: '$79.99',
    status: 'pending',
    date: '2024-01-14'
  }
];

const topProducts = [
  {
    name: 'Cattleya Orchid Premium',
    sales: 156,
    revenue: '$23,400',
    image: '🌺'
  },
  {
    name: 'Orchid Care Kit',
    sales: 134,
    revenue: '$12,060',
    image: '🧴'
  },
  {
    name: 'Rare Cattleya Collection',
    sales: 89,
    revenue: '$26,700',
    image: '🌸'
  },
  {
    name: 'Beginner Orchid Set',
    sales: 67,
    revenue: '$5,360',
    image: '🌱'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your orchid business today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                      {product.image}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.revenue}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 group">
              <PlusIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Add Product
            </button>
            <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 group">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              View Orders
            </button>
            <button className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 group">
              <UsersIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Manage Users
            </button>
            <button className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 group">
              <ChartBarIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              View Analytics
            </button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <h3 className="text-lg font-semibold text-green-900">System Status: All Systems Operational</h3>
          </div>
          <p className="text-green-700 mt-2">
            All services are running smoothly. Last updated: {new Date().toLocaleString()}
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
} 