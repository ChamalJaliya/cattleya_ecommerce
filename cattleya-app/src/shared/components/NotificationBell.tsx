'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

interface NotificationBellProps {
  unreadCount?: number;
  onClick?: () => void;
  className?: string;
}

export default function NotificationBell({ 
  unreadCount = 0, 
  onClick, 
  className = '' 
}: NotificationBellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuthStore();

  // Don't show notification bell if user is not authenticated
  if (!user) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative text-gray-700 hover:text-purple-600 p-2 transition-all duration-200 hover:bg-purple-50 rounded-lg ${className}`}
    >
      <AnimatePresence mode="wait">
        {unreadCount > 0 ? (
          <motion.div
            key="solid"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <BellSolidIcon className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="outline"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <BellIcon className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Badge */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1 -right-1"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-sm"
            />
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hover Effect */}
      {isHovered && unreadCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
        >
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </motion.div>
      )}
    </motion.button>
  );
} 