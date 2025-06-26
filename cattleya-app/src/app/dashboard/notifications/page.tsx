'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { Notification } from '@/core/application/stores/useNotificationStore';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ORDER_CONFIRMATION':
    case 'ORDER_STATUS_UPDATE':
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
      return <ShoppingBagIcon className="w-5 h-5" />;
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return <CreditCardIcon className="w-5 h-5" />;
    case 'PROMOTION':
      return <StarIcon className="w-5 h-5" />;
    case 'LOYALTY_REWARD':
      return <GiftIcon className="w-5 h-5" />;
    case 'WISHLIST_UPDATE':
      return <HeartIcon className="w-5 h-5" />;
    case 'SUPPORT_REPLY':
      return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    case 'SYSTEM_ALERT':
      return <InformationCircleIcon className="w-5 h-5" />;
    default:
      return <BellIcon className="w-5 h-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'border-red-500 bg-red-50';
    case 'HIGH':
      return 'border-orange-500 bg-orange-50';
    case 'MEDIUM':
      return 'border-yellow-500 bg-yellow-50';
    case 'LOW':
      return 'border-green-500 bg-green-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'ORDER_CONFIRMATION':
    case 'ORDER_STATUS_UPDATE':
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
      return 'text-blue-600';
    case 'PAYMENT_SUCCESS':
      return 'text-green-600';
    case 'PAYMENT_FAILED':
      return 'text-red-600';
    case 'PROMOTION':
      return 'text-purple-600';
    case 'LOYALTY_REWARD':
      return 'text-pink-600';
    case 'WISHLIST_UPDATE':
      return 'text-red-600';
    case 'SUPPORT_REPLY':
      return 'text-teal-600';
    case 'SYSTEM_ALERT':
      return 'text-indigo-600';
    default:
      return 'text-gray-600';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default function CustomerNotificationsPage() {
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const { 
    notifications, 
    unreadCount, 
    stats,
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    archiveNotification,
    unarchiveNotification,
    fetchNotifications
  } = useNotifications();

  useEffect(() => {
    console.log('Customer Notifications: Fetching notifications...');
    fetchNotifications({ limit: 50 });
  }, [fetchNotifications]);

  // Add debugging logs
  useEffect(() => {
    console.log('Customer Notifications Debug:', {
      notifications: notifications.length,
      unreadCount,
      stats,
      isLoading,
      error,
      user: useAuthStore.getState().user
    });
  }, [notifications, unreadCount, stats, isLoading, error]);

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'read' | 'archive' | 'delete') => {
    for (const id of selectedNotifications) {
      try {
        switch (action) {
          case 'read':
            await markAsRead(id);
            break;
          case 'archive':
            await archiveNotification(id);
            break;
          case 'delete':
            await deleteNotification(id);
            break;
        }
      } catch (error) {
        console.error(`Failed to ${action} notification ${id}:`, error);
      }
    }
    setSelectedNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (viewMode === 'unread' && notification.isRead) return false;
    if (viewMode === 'archived' && !notification.isArchived) return false;
    return true;
  });

  // Use stats from the hook instead of calculating locally
  const overviewStats = [
    {
      name: 'Total',
      value: stats?.total ?? notifications.length,
      icon: BellIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'All alerts & updates'
    },
    {
      name: 'Unread',
      value: stats?.unread ?? unreadCount,
      icon: ExclamationTriangleIcon,
      gradient: 'from-pink-500 via-red-500 to-rose-500',
      description: 'Require attention'
    },
    {
      name: 'Read',
      value: stats?.read ?? notifications.filter(n => n.isRead).length,
      icon: CheckIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Already seen'
    },
    {
      name: 'Archived',
      value: stats?.archived ?? notifications.filter(n => n.isArchived).length,
      icon: ArchiveBoxIcon,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'No longer active'
    }
  ];

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                My Notifications
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
                Stay updated with your orders and offers
              </p>
            </div>
            <button
              onClick={() => markAllAsRead()}
              className="group relative overflow-hidden flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative flex items-center">
                <CheckIcon className="w-5 h-5 mr-2" />
                Mark All Read
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                      {stat.value}
                    </p>
                    <span className="text-xs text-gray-500">{stat.description}</span>
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

        {/* Enhanced Search and Filters */}
        <div className="group relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={''}
                    onChange={() => {}}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={viewMode}
                  onChange={e => setViewMode(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification List - match Wishlist card style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No notifications found</p>
              <p className="text-gray-400 text-xs mt-1">We'll notify you about your orders, promotions, and updates</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 hover:bg-gray-50/50 transition-colors flex items-start space-x-4 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                    <div className={getTypeColor(notification.type)}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center space-x-4 mt-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                      {!notification.isArchived ? (
                        <button
                          onClick={() => archiveNotification(notification.id)}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center space-x-1"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                          <span>Archive</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => unarchiveNotification(notification.id)}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center space-x-1"
                        >
                          <EyeSlashIcon className="w-4 h-4" />
                          <span>Unarchive</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 