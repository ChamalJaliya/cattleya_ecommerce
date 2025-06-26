'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
}

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
      return 'border-blue-500 bg-blue-50';
    case 'LOW':
      return 'border-gray-400 bg-gray-50';
    default:
      return 'border-gray-300 bg-gray-50';
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
      return 'text-yellow-600';
    case 'SUPPORT_REPLY':
      return 'text-indigo-600';
    default:
      return 'text-gray-600';
  }
};

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 right-4 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto z-[99999]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white/20 text-white text-sm px-2 py-1 rounded-full font-medium"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {unreadCount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-white/80">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-white/90 hover:text-white underline transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs mt-1">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => onMarkAsRead?.(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                          <div className={getTypeColor(notification.type)}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex-shrink-0 mt-1"
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead?.(notification.id);
                                }}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <button
                  onClick={onViewAll}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 