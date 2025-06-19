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
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

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

  const totalRevenue = salesData.reduce((sum, month) => sum + month.revenue, 0);
  const totalOrders = salesData.reduce((sum, month) => sum + month.orders, 0);
  const totalCustomers = salesData.reduce((sum, month) => sum + month.customers, 0);
  const averageOrderValue = totalRevenue / totalOrders;

  const currentMonthRevenue = salesData[salesData.length - 1].revenue;
  const previousMonthRevenue = salesData[salesData.length - 2].revenue;
  const revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Track your business performance and insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center">
                <EyeIcon className="w-4 h-4 mr-2" />
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {revenueGrowth > 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">8.2%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">New Customers</p>
                <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg. Order Value</p>
                <p className="text-3xl font-bold text-gray-900">${averageOrderValue.toFixed(0)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">5.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <ArrowUpIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
            </div>
            
            {/* Simple Bar Chart Representation */}
            <div className="space-y-4">
              {salesData.map((data, index) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(data.revenue / Math.max(...salesData.map(d => d.revenue))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-sm font-medium text-gray-900 text-right">
                    ${(data.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Customer Segments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
              <UsersIcon className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {customerSegments.map((segment, index) => (
                <div key={segment.segment} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      index === 0 ? 'bg-purple-500' :
                      index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{segment.segment}</p>
                      <p className="text-sm text-gray-500">{segment.count} customers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${segment.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{segment.percentage}%</p>
                  </div>
                </div>
              ))}
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
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3 text-lg">
                      {index === 0 ? '🌺' : index === 1 ? '🧴' : index === 2 ? '🌸' : index === 3 ? '🏺' : '🌿'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
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
          </motion.div>

          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
              <GlobeAltIcon className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{source.source}</p>
                      <p className="text-sm text-gray-500">{source.visitors.toLocaleString()} visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{source.percentage}%</p>
                    <p className="text-sm text-gray-500">{source.conversion}% conv.</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Device Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Device Analytics</h3>
            <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <ComputerDesktopIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">65%</p>
              <p className="text-sm text-gray-600">Desktop</p>
              <p className="text-sm text-blue-600 font-medium mt-1">2,340 sessions</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <DevicePhoneMobileIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">30%</p>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="text-sm text-purple-600 font-medium mt-1">1,080 sessions</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <ComputerDesktopIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">5%</p>
              <p className="text-sm text-gray-600">Tablet</p>
              <p className="text-sm text-green-600 font-medium mt-1">180 sessions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
} 