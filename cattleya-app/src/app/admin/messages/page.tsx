'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowUturnLeftIcon,
  ArchiveBoxIcon,
  FlagIcon,
  InboxIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
  StarIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChartBarIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

const mockMessages = [
  { 
    id: '1', 
    type: 'order',
    from: { name: 'System Alert', email: 'system@cattleya.com', avatar: 'SA' }, 
    subject: 'New Order #12345 - Cattleya Labiata', 
    content: 'Customer Sarah Johnson placed an order for 2x Cattleya Labiata plants. Total: $89.98. Payment confirmed via PayPal.',
    status: 'unread', 
    priority: 'medium', 
    category: 'orders',
    createdAt: '2024-01-15 10:30',
    isStarred: false,
    isFlagged: false,
    metadata: { orderId: '12345', customerId: 'CUST001', amount: 89.98 }
  },
  { 
    id: '2', 
    type: 'refund',
    from: { name: 'Customer Support', email: 'support@cattleya.com', avatar: 'CS' }, 
    subject: 'Refund Request - Order #12340', 
    content: 'Customer Mike Wilson requested refund for damaged Cattleya Trianae. Order delivered on 2024-01-10. Photos attached.',
    status: 'unread', 
    priority: 'high', 
    category: 'refunds',
    createdAt: '2024-01-14 16:45',
    isStarred: true,
    isFlagged: true,
    metadata: { orderId: '12340', customerId: 'CUST002', refundAmount: 45.99 }
  },
  { 
    id: '3', 
    type: 'alert',
    from: { name: 'Inventory System', email: 'inventory@cattleya.com', avatar: 'IS' }, 
    subject: 'Low Stock Alert - Cattleya Premium Mix', 
    content: 'Cattleya Premium Potting Mix is running low. Current stock: 15 bags. Reorder point: 20 bags.',
    status: 'read', 
    priority: 'high', 
    category: 'alerts',
    createdAt: '2024-01-13 09:15',
    isStarred: false,
    isFlagged: true,
    metadata: { productId: 'MIX001', currentStock: 15, reorderPoint: 20 }
  },
  { 
    id: '4', 
    type: 'customer',
    from: { name: 'Emily Davis', email: 'emily.d@email.com', avatar: 'ED' }, 
    subject: 'Cattleya Care Question - Yellowing Leaves', 
    content: 'Hi, I purchased a Cattleya labiata last month and the leaves are turning yellow. I\'m worried about overwatering.',
    status: 'read', 
    priority: 'medium', 
    category: 'support',
    createdAt: '2024-01-12 14:20',
    isStarred: false,
    isFlagged: false,
    metadata: { customerId: 'CUST003', orderId: '12335' }
  },
  { 
    id: '5', 
    type: 'reward',
    from: { name: 'Loyalty System', email: 'loyalty@cattleya.com', avatar: 'LS' }, 
    subject: 'Reward Points Claimed - 500 Points', 
    content: 'Customer Robert Brown claimed 500 reward points for $25 discount. Applied to Order #12342.',
    status: 'read', 
    priority: 'low', 
    category: 'rewards',
    createdAt: '2024-01-11 11:00',
    isStarred: false,
    isFlagged: false,
    metadata: { customerId: 'CUST004', pointsClaimed: 500, discountAmount: 25 }
  },
  { 
    id: '6', 
    type: 'customer',
    from: { name: 'Lisa Chen', email: 'lisa.c@email.com', avatar: 'LC' }, 
    subject: 'New Customer Registration', 
    content: 'New customer Lisa Chen registered. Email: lisa.c@email.com. Welcome email sent.',
    status: 'read', 
    priority: 'low', 
    category: 'customers',
    createdAt: '2024-01-10 09:30',
    isStarred: false,
    isFlagged: false,
    metadata: { customerId: 'CUST005', registrationDate: '2024-01-10' }
  }
];

const categories = [
  { id: 'all', name: 'All Messages', icon: InboxIcon, count: 6, color: 'from-blue-500 to-cyan-500' },
  { id: 'orders', name: 'Orders', icon: ShoppingBagIcon, count: 1, color: 'from-green-500 to-emerald-500' },
  { id: 'refunds', name: 'Refunds', icon: ArrowUturnLeftIcon, count: 1, color: 'from-red-500 to-rose-500' },
  { id: 'alerts', name: 'Alerts', icon: ExclamationCircleIcon, count: 1, color: 'from-yellow-500 to-orange-500' },
  { id: 'support', name: 'Support', icon: ChatBubbleLeftEllipsisIcon, count: 1, color: 'from-purple-500 to-pink-500' },
  { id: 'rewards', name: 'Rewards', icon: StarIcon, count: 1, color: 'from-indigo-500 to-blue-500' },
  { id: 'customers', name: 'Customers', icon: UserIcon, count: 1, color: 'from-teal-500 to-cyan-500' }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'gmail' | 'cards' | 'table'>('gmail');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeMessage, setComposeMessage] = useState({
    to: '',
    subject: '',
    content: '',
    category: 'support',
    priority: 'medium'
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800 font-semibold';
      case 'read': return 'text-gray-600';
      default: return 'text-gray-600';
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

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'from-gray-500 to-gray-600';
  };

  const handleSendMessage = () => {
    console.log('Sending message:', composeMessage);
    setShowCompose(false);
    setComposeMessage({ to: '', subject: '', content: '', category: 'support', priority: 'medium' });
  };

  const toggleStar = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const toggleFlag = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isFlagged: !msg.isFlagged } : msg
    ));
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ));
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const starredCount = messages.filter(m => m.isStarred).length;
  const flaggedCount = messages.filter(m => m.isFlagged).length;
  const urgentMessages = messages.filter(m => m.priority === 'high').length;

  const statsData = [
    {
      name: 'Unread Messages',
      value: unreadCount.toString(),
      icon: ChatBubbleLeftEllipsisIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'Awaiting attention'
    },
    {
      name: 'Resolved Today',
      value: '12',
      icon: CheckIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Happy customers'
    },
    {
      name: 'Urgent Alerts',
      value: urgentMessages.toString(),
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      description: 'High priority issues'
    },
    {
      name: 'Avg. Response',
      value: '1.8 hours',
      icon: ClockIcon,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      description: 'Quick support'
    }
  ];

  const renderGmailView = () => (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Compose Button */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={() => setShowCompose(true)}
            className="w-full group relative overflow-hidden"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center group-hover:scale-105">
              <PlusIcon className="w-5 h-5 mr-2" />
              Compose
            </div>
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                    <category.icon className="w-4 h-4 text-white" />
                  </div>
                  <span>{category.name}</span>
                </div>
                <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unread</span>
                <span className="font-semibold text-blue-600">{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Starred</span>
                <span className="font-semibold text-yellow-600">{starredCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Flagged</span>
                <span className="font-semibold text-red-600">{flaggedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                message.status === 'unread' ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                markAsRead(message.id);
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(message.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          message.isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlag(message.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          message.isFlagged ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <FlagIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {message.from.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getStatusColor(message.status)}`}>
                          {message.from.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <div className={`w-3 h-3 bg-gradient-to-r ${getCategoryColor(message.category)} rounded-full`}></div>
                      </div>
                      <p className={`text-sm truncate ${getStatusColor(message.status)}`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {message.content.substring(0, 80)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{message.createdAt}</span>
                    {message.status === 'unread' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCardsView = () => (
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
                          {message.from.avatar}
                      </div>
                      <div className="ml-3">
                          <h3 className="text-sm font-bold text-gray-800 truncate">{message.from.name}</h3>
                          <p className="text-xs text-gray-500">{message.createdAt}</p>
                      </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getPriorityColor(message.priority)}`}>{message.priority}</span>
              </div>
              
              <h4 className="text-base font-semibold text-gray-900 mb-2 truncate group-hover:text-purple-700 flex-1">{message.subject}</h4>
              
              <div className="flex justify-between items-center text-sm mt-auto">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(message.status)}`}>{message.status}</span>
                  <button 
                    onClick={() => setSelectedMessage(message)}
                    className="text-purple-600 hover:text-purple-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View →
                  </button>
              </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTableView = () => (
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">From</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
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
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">{message.from.avatar}</div>
                        <div className="text-sm font-medium text-gray-900">{message.from.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-semibold max-w-sm truncate">{message.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(message.status)}`}>{message.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(message.priority)}`}>{message.priority}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-4 h-4 bg-gradient-to-r ${getCategoryColor(message.category)} rounded-full`}></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedMessage(message)}
                      className="text-purple-600 hover:text-purple-900 font-bold"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header with Dazzling Effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-xl -z-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                  Admin Messages
                </h1>
                <p className="text-gray-600 text-lg">Manage all business communications with style</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <SparklesIcon className="w-5 h-5 text-purple-500 animate-pulse" />
                  <FireIcon className="w-4 h-4 text-orange-500 animate-bounce" />
                </div>
                <button 
                  onClick={() => setShowCompose(true)}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Compose
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

          {/* Search and Controls */}
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
                      onClick={() => setViewMode('gmail')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'gmail'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <InboxIcon className="w-4 h-4 mr-1" />
                      Gmail
                    </button>
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
                  
                  <button className="group/btn relative overflow-hidden">
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
          <div className="min-h-[600px]">
            {viewMode === 'gmail' && renderGmailView()}
            {viewMode === 'cards' && renderCardsView()}
            {viewMode === 'table' && renderTableView()}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Compose Message</h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                  <input
                    type="email"
                    value={composeMessage.to}
                    onChange={(e) => setComposeMessage({...composeMessage, to: e.target.value})}
                    placeholder="recipient@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={composeMessage.subject}
                    onChange={(e) => setComposeMessage({...composeMessage, subject: e.target.value})}
                    placeholder="Message subject"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={composeMessage.category}
                      onChange={(e) => setComposeMessage({...composeMessage, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="support">Support</option>
                      <option value="orders">Orders</option>
                      <option value="refunds">Refunds</option>
                      <option value="alerts">Alerts</option>
                      <option value="rewards">Rewards</option>
                      <option value="customers">Customers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={composeMessage.priority}
                      onChange={(e) => setComposeMessage({...composeMessage, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={composeMessage.content}
                    onChange={(e) => setComposeMessage({...composeMessage, content: e.target.value})}
                    placeholder="Type your message..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                      <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                      Send Message
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                    <p className="text-purple-100 mt-1">From: {selectedMessage.from.name} ({selectedMessage.from.email})</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {selectedMessage.from.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMessage.from.name}</h3>
                      <p className="text-sm text-gray-500">{selectedMessage.from.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                    <div className={`w-4 h-4 bg-gradient-to-r ${getCategoryColor(selectedMessage.category)} rounded-full`}></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Message Content</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {selectedMessage.createdAt}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.content}</p>
                </div>

                {selectedMessage.metadata && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Message Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedMessage.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium text-blue-800">{key}:</span>
                          <span className="ml-2 text-blue-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors">
                        <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                      <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors">
                        <FlagIcon className="w-4 h-4 mr-2" />
                        Flag
                      </button>
                      <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors">
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                    <button className="group relative overflow-hidden">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                        <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                        Reply
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
} 