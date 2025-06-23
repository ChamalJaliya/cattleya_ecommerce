'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChevronDownIcon,
  UserPlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';

// Mock customers data
const mockCustomers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'JS',
    status: 'active',
    joinDate: '2023-06-15',
    lastLogin: '2024-01-15',
    totalOrders: 8,
    totalSpent: 1247.92,
    loyaltyPoints: 1250,
    averageOrderValue: 155.99,
    location: 'New York, NY',
    customerType: 'premium'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 234-5678',
    avatar: 'SJ',
    status: 'active',
    joinDate: '2023-08-22',
    lastLogin: '2024-01-14',
    totalOrders: 12,
    totalSpent: 2156.34,
    loyaltyPoints: 2150,
    averageOrderValue: 179.69,
    location: 'Los Angeles, CA',
    customerType: 'vip'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    phone: '+1 (555) 345-6789',
    avatar: 'MW',
    status: 'active',
    joinDate: '2023-11-10',
    lastLogin: '2024-01-13',
    totalOrders: 3,
    totalSpent: 567.89,
    loyaltyPoints: 568,
    averageOrderValue: 189.30,
    location: 'Miami, FL',
    customerType: 'regular'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '+1 (555) 456-7890',
    avatar: 'ED',
    status: 'inactive',
    joinDate: '2023-04-05',
    lastLogin: '2023-12-20',
    totalOrders: 5,
    totalSpent: 423.45,
    loyaltyPoints: 423,
    averageOrderValue: 84.69,
    location: 'Seattle, WA',
    customerType: 'regular'
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '+1 (555) 567-8901',
    avatar: 'RB',
    status: 'blocked',
    joinDate: '2023-09-18',
    lastLogin: '2024-01-05',
    totalOrders: 2,
    totalSpent: 89.98,
    loyaltyPoints: 0,
    averageOrderValue: 44.99,
    location: 'Chicago, IL',
    customerType: 'regular'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    phone: '+1 (555) 678-9012',
    avatar: 'LA',
    status: 'active',
    joinDate: '2023-12-01',
    lastLogin: '2024-01-16',
    totalOrders: 15,
    totalSpent: 3245.67,
    loyaltyPoints: 3246,
    averageOrderValue: 216.38,
    location: 'San Francisco, CA',
    customerType: 'vip'
  }
];

const statusOptions = ['All Status', 'active', 'inactive', 'blocked'];
const customerTypeOptions = ['All Types', 'regular', 'premium', 'vip'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedType, setSelectedType] = useState('All Types');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All Status' || customer.status === selectedStatus;
    const matchesType = selectedType === 'All Types' || customer.customerType === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Customers', href: '/admin/customers' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'regular':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBlockCustomer = (id: string) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, status: customer.status === 'blocked' ? 'active' : 'blocked' }
        : customer
    ));
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    avgSpent: customers.length > 0 ?
      Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0,
    new: customers.filter(c => new Date(c.joinDate) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
  };

  const statsData = [
    {
      name: 'Total Customers',
      value: stats.total.toString(),
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Customers in database'
    },
    {
      name: 'Active Customers',
      value: stats.active.toString(),
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: CheckIcon,
      color: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Currently active'
    },
    {
      name: 'Avg. Spent',
      value: `$${stats.avgSpent}`,
      change: '+8.5%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 via-orange-500 to-red-500',
      iconBg: 'from-yellow-400 to-orange-600',
      glowColor: 'shadow-yellow-500/30',
      description: 'Average per customer'
    },
    {
      name: 'New this Month',
      value: stats.new.toString(),
      change: '-1.5%',
      changeType: 'decrease' as const,
      icon: UserPlusIcon,
      color: 'from-red-500 via-pink-500 to-rose-500',
      iconBg: 'from-red-400 to-pink-600',
      glowColor: 'shadow-red-500/30',
      description: 'Joined in last 30 days'
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
                  Customers Management
                </h1>
                <p className="text-gray-600 text-lg">Manage, analyze, and connect with your customers.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Customers Dashboard Overview
                  </span>
                </div>
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Add Customer
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
                      placeholder="Search customers, email, phone..."
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
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
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
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        >
                          {statusOptions.map(option => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Customer Type</label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        >
                          {customerTypeOptions.map(option => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="min-h-[600px]">
          {viewMode === 'cards' ? (
            <motion.div 
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center font-bold text-purple-600 text-xl">
                          {customer.avatar}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ShoppingBagIcon className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{customer.totalOrders} orders · <span className="font-bold text-gray-800">${customer.totalSpent.toLocaleString()}</span></span>
                      </div>
                       <div className="flex items-center text-gray-600">
                        <StarIcon className="w-4 h-4 mr-3 text-yellow-400" />
                        <span>{customer.loyaltyPoints} loyalty points</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getCustomerTypeColor(customer.customerType)}`}>
                      {customer.customerType}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleBlockCustomer(customer.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${customer.status === 'blocked' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'}`}
                      >
                        <NoSymbolIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative mb-8"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Spent</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-purple-50/50 transition-colors duration-200 group/row"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-purple-600 text-lg">
                                {customer.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                                <div className={`font-normal px-1.5 py-0.5 text-xs rounded-full inline-block mt-1 ${getCustomerTypeColor(customer.customerType)}`}>
                                  {customer.customerType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-xs text-gray-500 mt-1">{customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.joinDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ${customer.totalSpent.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleBlockCustomer(customer.id)}
                                className={`group/action relative overflow-hidden p-1.5 rounded-lg transition-all duration-200 group-hover/action:scale-110 ${customer.status === 'blocked' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'}`}
                              >
                                <NoSymbolIcon className="w-5 h-5" />
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
          {/* Pagination would go here */}
        </div>
      </div>
    </AdminLayout>
  );
} 