'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NotificationBell from '@/shared/components/NotificationBell';
import NotificationDropdown from '@/shared/components/NotificationDropdown';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { notificationsApi } from '@/core/infrastructure/api/notificationsApi';

export default function DebugNotificationsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [apiTestResults, setApiTestResults] = useState<any>({});
  const { notifications, unreadCount, markAsRead, markAllAsRead, createNotification, fetchNotifications, fetchUnreadCount, isLoading, error } = useNotifications();
  const { user } = useAuthStore();

  const handleNotificationClick = () => {
    console.log('🔔 Notification bell clicked');
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMarkAsRead = (id: string) => {
    console.log('📖 Marking notification as read:', id);
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    console.log('📖 Marking all notifications as read');
    markAllAsRead();
  };

  const handleViewAll = () => {
    setIsDropdownOpen(false);
  };

  const handleCreateTestNotification = async () => {
    console.log('🧪 Creating test notification...');
    try {
      await createNotification({
        type: 'ORDER_CONFIRMATION',
        title: 'Test Notification',
        message: 'This is a test notification to demonstrate the UI.',
        priority: 'MEDIUM',
      });
      console.log('✅ Test notification created successfully');
    } catch (error) {
      console.error('❌ Failed to create test notification:', error);
    }
  };

  const testApiEndpoints = async () => {
    console.log('🧪 Testing API endpoints...');
    const results: any = {};

    try {
      // Test getNotifications
      console.log('📡 Testing getNotifications...');
      const notificationsResponse = await notificationsApi.getNotifications({ limit: 5 });
      results.getNotifications = { success: true, data: notificationsResponse };
      console.log('✅ getNotifications successful:', notificationsResponse);
    } catch (error: any) {
      results.getNotifications = { success: false, error: error.message };
      console.error('❌ getNotifications failed:', error);
    }

    try {
      // Test getUnreadCount
      console.log('📡 Testing getUnreadCount...');
      const unreadResponse = await notificationsApi.getUnreadCount();
      results.getUnreadCount = { success: true, data: unreadResponse };
      console.log('✅ getUnreadCount successful:', unreadResponse);
    } catch (error: any) {
      results.getUnreadCount = { success: false, error: error.message };
      console.error('❌ getUnreadCount failed:', error);
    }

    try {
      // Test getStats
      console.log('📡 Testing getStats...');
      const statsResponse = await notificationsApi.getStats();
      results.getStats = { success: true, data: statsResponse };
      console.log('✅ getStats successful:', statsResponse);
    } catch (error: any) {
      results.getStats = { success: false, error: error.message };
      console.error('❌ getStats failed:', error);
    }

    setApiTestResults(results);
  };

  const refreshNotifications = async () => {
    console.log('🔄 Refreshing notifications...');
    try {
      await fetchNotifications({ limit: 10 });
      await fetchUnreadCount();
      console.log('✅ Notifications refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh notifications:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 Debug page mounted');
    console.log('👤 User:', user);
    console.log('📊 Current state:', { notifications, unreadCount, isLoading, error });
  }, [user, notifications, unreadCount, isLoading, error]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Notification Debug Page</h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 User Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Notification State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Notification State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Unread Count:</strong> {unreadCount}</p>
              <p><strong>Total Notifications:</strong> {notifications?.length || 0}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
            <div>
              <p><strong>Dropdown Open:</strong> {isDropdownOpen ? 'Yes' : 'No'}</p>
              <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Notification Bell Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔔 Notification Bell Test</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <NotificationBell
                unreadCount={unreadCount}
                onClick={handleNotificationClick}
              />
              
              <NotificationDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                notifications={notifications.slice(0, 5)}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onViewAll={handleViewAll}
              />
            </div>
            <div>
              <p>Click the bell to test notification fetching</p>
              <p className="text-sm text-gray-600">Check browser console for debug logs</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎮 Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateTestNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Test Notification
            </button>
            <button
              onClick={refreshNotifications}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh Notifications
            </button>
            <button
              onClick={testApiEndpoints}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test API Endpoints
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* API Test Results */}
        {Object.keys(apiTestResults).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📡 API Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiTestResults, null, 2)}
            </pre>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Notifications List</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                      >
                        Mark Read
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 