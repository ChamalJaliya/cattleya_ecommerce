'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
// import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';

// Mock analytics data
const salesData = [
  { month: 'Jan', revenue: 45231, orders: 234, customers: 89 },
  { month: 'Feb', revenue: 52187, orders: 267, customers: 102 },
  { month: 'Mar', revenue: 48956, orders: 245, customers: 95 },
  { month: 'Apr', revenue: 61234, orders: 312, customers: 118 },
  { month: 'May', revenue: 58743, orders: 289, customers: 134 },
  { month: 'Jun', revenue: 67891, orders: 356, customers: 142 }
];

const topProducts = [
  { name: 'Cattleya Orchid Premium', sales: 156, revenue: 23400, growth: 12.5 },
  { name: 'Orchid Care Kit', sales: 134, revenue: 12060, growth: 8.2 },
  { name: 'Rare Cattleya Collection', sales: 89, revenue: 26700, growth: -2.1 },
  { name: 'Premium Potting Mix', sales: 298, revenue: 7445, growth: 15.7 },
  { name: 'Orchid Fertilizer Pro', sales: 145, revenue: 4348, growth: 5.3 }
];

const customerSegments = [
  { segment: 'VIP Customers', count: 45, percentage: 15, revenue: 45230 },
  { segment: 'Premium Customers', count: 89, percentage: 30, revenue: 32180 },
  { segment: 'Regular Customers', count: 164, percentage: 55, revenue: 18590 }
];

const trafficSources = [
  { source: 'Organic Search', visitors: 2340, percentage: 45, conversion: 3.2 },
  { source: 'Social Media', visitors: 1560, percentage: 30, conversion: 2.8 },
  { source: 'Direct', visitors: 890, percentage: 17, conversion: 4.1 },
  { source: 'Email Marketing', visitors: 420, percentage: 8, conversion: 5.7 }
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 6 Months');

  // const breadcrumbItems = [
  //   { label: 'Dashboard', href: '/admin/dashboard' },
  //   { label: 'Analytics', href: '/admin/analytics' }
  // ];

  const totalRevenue = salesData.reduce((sum, month) => sum + month.revenue, 0);
  const totalOrders = salesData.reduce((sum, month) => sum + month.orders, 0);
  const totalCustomers = salesData.reduce((sum, month) => sum + month.customers, 0);
  const averageOrderValue = totalRevenue / totalOrders;

  const currentMonthRevenue = salesData[salesData.length - 1].revenue;
  const previousMonthRevenue = salesData[salesData.length - 2].revenue;
  const revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  const ordersGrowth = 8.2;
  const customersGrowth = 12.5;
  const aovGrowth = 5.1;

  const statsData = [
    {
      name: 'Total Revenue',
      value: `$${(totalRevenue/1000).toFixed(1)}k`,
      change: `${Math.abs(revenueGrowth).toFixed(1)}%`,
      changeType: revenueGrowth > 0 ? 'increase' as const : 'decrease' as const,
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Total sales revenue'
    },
    {
      name: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: `${ordersGrowth.toFixed(1)}%`,
      changeType: 'increase' as const,
      icon: ShoppingBagIcon,
      color: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Total orders placed'
    },
    {
      name: 'New Customers',
      value: totalCustomers.toString(),
      change: `${customersGrowth.toFixed(1)}%`,
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'from-purple-500 via-pink-500 to-rose-500',
      iconBg: 'from-purple-400 to-pink-600',
      glowColor: 'shadow-purple-500/30',
      description: 'Joined in period'
    },
    {
      name: 'Avg. Order Value',
      value: `$${averageOrderValue.toFixed(0)}`,
      change: `${aovGrowth.toFixed(1)}%`,
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'from-yellow-500 via-orange-500 to-red-500',
      iconBg: 'from-yellow-400 to-orange-600',
      glowColor: 'shadow-yellow-500/30',
      description: 'Average per order'
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                  Business Analytics
                </h1>
                <p className="text-gray-600 text-lg">Track your business performance and insights.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Analytics Dashboard Overview
                  </span>
                </div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                </select>
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    View Report
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <p>{selectedPeriod}</p>
                    <CalendarDaysIcon className="w-5 h-5"/>
                  </div>
                </div>
                <div className="h-72">
                  <div className="w-full h-full bg-gray-50 dark:bg-gray-800/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-16 h-16 text-gray-300"/>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Customer Segments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
                  <UsersIcon className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  {customerSegments.map((segment, index) => (
                    <div key={segment.segment} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          index === 0 ? 'bg-purple-500' :
                          index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{segment.segment}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{segment.count} customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${segment.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{segment.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Products & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center mr-3 text-lg">
                          {index === 0 ? '🌺' : index === 1 ? '🧴' : index === 2 ? '🌸' : index === 3 ? '🏺' : '🌿'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${product.revenue.toLocaleString()}</p>
                        <div className="flex items-center">
                          {product.growth > 0 ? (
                            <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownIcon className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(product.growth)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Traffic Sources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
                  <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  {trafficSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{source.source}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{source.visitors.toLocaleString()} visitors</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{source.percentage}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{source.conversion}% conv.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}