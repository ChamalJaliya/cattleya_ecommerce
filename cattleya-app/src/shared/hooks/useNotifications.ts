import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/core/application/stores/useNotificationStore';
import { notificationsApi, NotificationQueryOptions } from '@/core/infrastructure/api/notificationsApi';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    setNotifications,
    addNotification,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
    removeNotification,
    setUnreadCount,
    setStats,
    setLoading,
    setError,
    clearError,
  } = useNotificationStore();

  // Fetch notifications
  const fetchNotifications = useCallback(async (options: NotificationQueryOptions = {}) => {
    if (!user) return;
    
    try {
      setLoading(true);
      clearError();
      const response = await notificationsApi.getNotifications(options);
      const notifications = response.notifications || [];
      setNotifications(notifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications, setLoading, setError, clearError]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await notificationsApi.getUnreadCount();
      const count = response.count || 0;
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user, setUnreadCount]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const stats = await notificationsApi.getStats();
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to fetch notification stats:', err);
    }
  }, [user, setStats]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      await notificationsApi.markAsRead(id);
      markAsReadStore(id);
      // Refresh unread count
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  }, [user, markAsReadStore, fetchUnreadCount, setError]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await notificationsApi.markAllAsRead();
      markAllAsReadStore();
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, [user, markAllAsReadStore, setUnreadCount, setError]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      await notificationsApi.deleteNotification(id);
      removeNotification(id);
      // Refresh unread count
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
    }
  }, [user, removeNotification, fetchUnreadCount, setError]);

  // Archive notification
  const archiveNotification = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const updatedNotification = await notificationsApi.archiveNotification(id);
      const updatedNotifications = notifications.map(notification =>
        notification.id === id ? updatedNotification : notification
      );
      setNotifications(updatedNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to archive notification');
    }
  }, [user, notifications, setNotifications, setError]);

  // Unarchive notification
  const unarchiveNotification = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const updatedNotification = await notificationsApi.unarchiveNotification(id);
      const updatedNotifications = notifications.map(notification =>
        notification.id === id ? updatedNotification : notification
      );
      setNotifications(updatedNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive notification');
    }
  }, [user, notifications, setNotifications, setError]);

  // Create notification (for testing or admin use)
  const createNotification = useCallback(async (data: any) => {
    if (!user) return;
    
    try {
      const newNotification = await notificationsApi.createNotification(data);
      addNotification(newNotification);
      // Refresh unread count
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Failed to create notification');
    }
  }, [user, addNotification, fetchUnreadCount, setError]);

  // Initialize notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications({ limit: 10 });
      fetchUnreadCount();
      fetchStats();
    }
  }, [user, fetchNotifications, fetchUnreadCount, fetchStats]);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    unarchiveNotification,
    createNotification,
    clearError,
  };
}; 