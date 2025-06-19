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
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

const mockMessages = [
  {
    id: '1',
    customer: {
      name: 'John Smith',
      email: 'john@example.com',
      avatar: 'JS'
    },
    subject: 'Question about orchid care',
    message: 'Hi, I recently purchased a Cattleya orchid and I\'m not sure about the watering schedule. Could you provide some guidance?',
    status: 'open',
    priority: 'medium',
    category: 'support',
    createdAt: '2024-01-15 10:30',
    lastReply: '2024-01-15 14:20',
    replies: 2
  },
  {
    id: '2',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'SJ'
    },
    subject: 'Shipping delay inquiry',
    message: 'My order ORD-002 was supposed to arrive yesterday but I haven\'t received it yet. Can you check the status?',
    status: 'pending',
    priority: 'high',
    category: 'shipping',
    createdAt: '2024-01-14 16:45',
    lastReply: null,
    replies: 0
  },
  {
    id: '3',
    customer: {
      name: 'Mike Wilson',
      email: 'mike@example.com',
      avatar: 'MW'
    },
    subject: 'Product recommendation request',
    message: 'I\'m a beginner and looking for easy-to-care orchids. What would you recommend for someone just starting out?',
    status: 'resolved',
    priority: 'low',
    category: 'sales',
    createdAt: '2024-01-13 09:15',
    lastReply: '2024-01-13 11:30',
    replies: 3
  },
  {
    id: '4',
    customer: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: 'ED'
    },
    subject: 'Damaged package received',
    message: 'The orchid I received was damaged during shipping. The pot was cracked and some leaves were broken. I need a replacement.',
    status: 'urgent',
    priority: 'high',
    category: 'complaint',
    createdAt: '2024-01-12 14:20',
    lastReply: '2024-01-12 15:45',
    replies: 4
  },
  {
    id: '5',
    customer: {
      name: 'Robert Brown',
      email: 'robert@example.com',
      avatar: 'RB'
    },
    subject: 'Bulk order pricing',
    message: 'I\'m interested in purchasing 20+ orchids for my garden center. Do you offer bulk pricing or wholesale rates?',
    status: 'open',
    priority: 'medium',
    category: 'sales',
    createdAt: '2024-01-11 11:00',
    lastReply: null,
    replies: 0
  }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'resolved':
        return <CheckIcon className="w-4 h-4" />;
      case 'urgent':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
    }
  };

  const openMessages = messages.filter(m => m.status === 'open').length;
  const pendingMessages = messages.filter(m => m.status === 'pending').length;
  const urgentMessages = messages.filter(m => m.status === 'urgent').length;
  const avgResponseTime = '2.5 hours';

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Messages</h1>
              <p className="text-gray-600 mt-2">Manage customer support and inquiries</p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2" />
              New Message
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Messages</p>
                <p className="text-2xl font-bold text-gray-900">{openMessages}</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingMessages}</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{urgentMessages}</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{avgResponseTime}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {message.customer.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1">{message.status}</span>
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          {message.customer.name}
                        </div>
                        <div className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {message.customer.email}
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {message.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">{message.message}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Created: {message.createdAt}</span>
                          {message.lastReply && (
                            <span>Last reply: {message.lastReply}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>{message.replies} replies</span>
                          <button className="text-purple-600 hover:text-purple-700 font-medium">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 