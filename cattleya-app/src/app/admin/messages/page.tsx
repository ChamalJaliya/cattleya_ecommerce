'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

const mockMessages = [
  { id: '1', customer: { name: 'John Smith', avatar: 'JS' }, subject: 'Question about orchid care', status: 'open', priority: 'medium', createdAt: '2024-01-15 10:30' },
  { id: '2', customer: { name: 'Sarah Johnson', avatar: 'SJ' }, subject: 'Shipping delay inquiry', status: 'pending', priority: 'high', createdAt: '2024-01-14 16:45' },
  { id: '3', customer: { name: 'Mike Wilson', avatar: 'MW' }, subject: 'Product recommendation request', status: 'resolved', priority: 'low', createdAt: '2024-01-13 09:15' },
  { id: '4', customer: { name: 'Emily Davis', avatar: 'ED' }, subject: 'Damaged package received', status: 'urgent', priority: 'high', createdAt: '2024-01-12 14:20' },
  { id: '5', customer: { name: 'Robert Brown', avatar: 'RB' }, subject: 'Bulk order pricing', status: 'open', priority: 'medium', createdAt: '2024-01-11 11:00' }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openMessages = messages.filter(m => m.status === 'open').length;
  const resolvedMessages = messages.filter(m => m.status === 'resolved').length;
  const urgentMessages = messages.filter(m => m.status === 'urgent').length;
  const avgResponseTime = '2.5 hours';

  const statsData = [
    {
      name: 'Open Messages',
      value: openMessages.toString(),
      change: '+2',
      changeType: 'increase',
      icon: ChatBubbleLeftEllipsisIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'Awaiting response'
    },
    {
      name: 'Resolved Today',
      value: '12', // Mock data
      change: ``,
      changeType: 'increase',
      icon: CheckIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Tickets closed today'
    },
    {
      name: 'Urgent Alerts',
      value: urgentMessages.toString(),
      change: '',
      changeType: 'neutral',
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      description: 'High priority issues'
    },
    {
      name: 'Avg. Response',
      value: avgResponseTime,
      change: '',
      changeType: 'neutral',
      icon: ClockIcon,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      description: 'Average first reply time'
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
                  Message Center
                </h1>
                <p className="text-gray-600 text-lg">Manage all customer inquiries and messages.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    New Message
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
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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

          {/* Search and Filters */}
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
                      placeholder="Search messages, subjects, customers..."
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
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Content Area */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMessages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 flex flex-col h-[220px]">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                  {message.customer.avatar}
                              </div>
                              <div className="ml-3">
                                  <h3 className="text-sm font-bold text-gray-800 truncate">{message.customer.name}</h3>
                                  <p className="text-xs text-gray-500">{message.createdAt}</p>
                              </div>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getPriorityColor(message.priority)}`}>{message.priority}</span>
                      </div>
                      
                      <h4 className="text-base font-semibold text-gray-900 mb-2 truncate group-hover:text-purple-700 flex-1">{message.subject}</h4>
                      
                      <div className="flex justify-between items-center text-sm mt-auto">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(message.status)}`}>{message.status}</span>
                          <button className="text-purple-600 hover:text-purple-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                          </button>
                      </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredMessages.map((message, index) => (
                        <motion.tr
                          key={message.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-purple-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">{message.customer.avatar}</div>
                                <div className="text-sm font-medium text-gray-900">{message.customer.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-semibold max-w-sm truncate">{message.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(message.status)}`}>{message.status}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(message.priority)}`}>{message.priority}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.createdAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900 font-bold">View</button>
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
      </div>
    </AdminLayout>
  );
} 