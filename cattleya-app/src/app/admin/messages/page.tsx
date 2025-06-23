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
  SparklesIcon,
  ListBulletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import RichTextEditor from '@/shared/components/RichTextEditor';
import ComposeMessageModal from '@/shared/components/ComposeMessageModal';
import MessageDetail from '@/shared/components/MessageDetail';
import MessageNavigation from '@/shared/components/MessageNavigation';

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
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);

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

  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message);
    // Here you would typically add the new message to your state
    // For example: setMessages([ { id: Date.now().toString(), ...message }, ...messages]);
    setShowCompose(false);
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
      change: '+3',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftEllipsisIcon,
      color: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Awaiting attention'
    },
    {
      name: 'Resolved Today',
      value: '12',
      change: '+2',
      changeType: 'increase' as const,
      icon: CheckIcon,
      color: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Happy customers'
    },
    {
      name: 'Urgent Alerts',
      value: urgentMessages.toString(),
      change: '-1',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 via-rose-500 to-pink-500',
      iconBg: 'from-red-400 to-rose-600',
      glowColor: 'shadow-red-500/30',
      description: 'High priority issues'
    },
    {
      name: 'Avg. Response',
      value: '1.8 hours',
      change: '-0.2h',
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'from-yellow-500 via-orange-500 to-red-500',
      iconBg: 'from-yellow-400 to-orange-600',
      glowColor: 'shadow-yellow-500/30',
      description: 'Quick support'
    }
  ];

  const renderGmailView = () => (
    <div className="h-full flex flex-col">
      <MessageNavigation 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCompose={() => setShowCompose(true)}
      />
      <div className="flex-1 flex bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200/50">
        {/* Messages List */}
        <div className="w-1/3 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedMessage?.id === message.id ? 'bg-purple-50' :
                message.status === 'unread' ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                markAsRead(message.id);
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${getCategoryColor(message.category)}`}>
                      {message.from.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800 text-sm truncate">{message.from.name}</p>
                      <p className="text-gray-600 text-xs truncate max-w-xs">{message.subject}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-xs text-gray-400 space-y-1">
                    <span>{message.createdAt.split(' ')[1]}</span>
                    <div className="flex items-center space-x-1">
                      {message.isFlagged && <FlagIcon className="w-3 h-3 text-red-500" />}
                      {message.isStarred && <StarIcon className="w-3 h-3 text-yellow-500" />}
                      {message.status === 'unread' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Message Detail */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            <MessageDetail selectedMessage={selectedMessage} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

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
                  Messages
                </h1>
                <p className="text-gray-600 text-lg">Manage all your communications in one place.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Messages Dashboard Overview
                  </span>
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
          
          <div className="bg-white/50 backdrop-blur-lg p-4 rounded-2xl shadow-inner border border-gray-200/50 mb-8">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-lg">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="h-[calc(100vh-460px)]">
            {renderGmailView()}
          </div>
        </div>
        
        <AnimatePresence>
          {showCompose && (
            <ComposeMessageModal
              onClose={() => setShowCompose(false)}
              onSend={handleSendMessage}
            />
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
} 