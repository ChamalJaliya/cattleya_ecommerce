'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  FunnelIcon,
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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { Notification } from '@/core/application/stores/useNotificationStore';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import Pagination from '@/shared/components/Pagination';

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
    case 'LOW_STOCK':
      return <ExclamationTriangleIcon className="w-5 h-5" />;
    case 'PROMOTION':
      return <StarIcon className="w-5 h-5" />;
    case 'SYSTEM_ALERT':
      return <InformationCircleIcon className="w-5 h-5" />;
    case 'SUPPORT_REPLY':
      return <CheckCircleIcon className="w-5 h-5" />;
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
    case 'LOW_STOCK':
      return 'text-orange-600';
    case 'PROMOTION':
      return 'text-purple-600';
    case 'SYSTEM_ALERT':
      return 'text-indigo-600';
    case 'SUPPORT_REPLY':
      return 'text-teal-600';
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

export default function AdminNotificationsPage() {
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    search: ''
  });

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
    fetchNotifications({ limit: 50 });
  }, [fetchNotifications]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
                  Notifications
                </h1>
                <p className="text-gray-600 text-lg">System alerts and updates</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Notification Center
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total, Unread, Read, Archived cards - use same style as Products */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total</p>
                      <div className="ml-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stats?.total ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Notifications in system</p>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl transition-all duration-300">
                      <BellIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Unread</p>
                      <div className="ml-2 w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stats?.unread ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Require attention</p>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-xl transition-all duration-300">
                      <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Read</p>
                      <div className="ml-2 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stats?.read ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Already seen</p>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-xl transition-all duration-300">
                      <CheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Archived</p>
                      <div className="ml-2 w-2 h-2 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stats?.archived ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">No longer active</p>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-500/30 group-hover:shadow-xl transition-all duration-300">
                      <ArchiveBoxIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
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
                      placeholder="Search notifications..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Tabs for All/Unread/Archived */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    {[
                      { key: 'all', label: 'All', count: notifications.length },
                      { key: 'unread', label: 'Unread', count: unreadCount },
                      { key: 'archived', label: 'Archived', count: notifications.filter(n => n.isArchived).length }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setViewMode(tab.key as any)}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                          viewMode === tab.key
                            ? 'bg-white shadow-sm text-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => markAllAsRead()}
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105 font-medium">
                      Mark All Read
                    </div>
                  </button>
                </div>
              </div>
              {/* Filters Row */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Types</option>
                    <option value="ORDER_CONFIRMATION">Order Confirmation</option>
                    <option value="ORDER_STATUS_UPDATE">Order Status Update</option>
                    <option value="ORDER_SHIPPED">Order Shipped</option>
                    <option value="ORDER_DELIVERED">Order Delivered</option>
                    <option value="PAYMENT_SUCCESS">Payment Success</option>
                    <option value="PAYMENT_FAILED">Payment Failed</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="PROMOTION">Promotion</option>
                    <option value="SYSTEM_ALERT">System Alert</option>
                    <option value="SUPPORT_REPLY">Support Reply</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification List - match Products card/table style */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No notifications found</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you when something important happens</p>
              </div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Select All</span>
                  </div>
                </div>
                {/* Notifications */}
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 hover:bg-gray-50/50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                        />
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 