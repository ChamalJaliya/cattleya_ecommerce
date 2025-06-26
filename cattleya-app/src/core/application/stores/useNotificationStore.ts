import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  isArchived: boolean;
  metadata?: any;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  setStats: (stats: NotificationStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  stats: null,
  isLoading: false,
  error: null,
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        const newNotifications = [notification, ...notifications];
        const unreadCount = newNotifications.filter(n => !n.isRead).length;
        set({ notifications: newNotifications, unreadCount });
      },

      markAsRead: (id) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },

      markAllAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        set({ notifications: updatedNotifications, unreadCount: 0 });
      },

      removeNotification: (id) => {
        const { notifications } = get();
        const filteredNotifications = notifications.filter(n => n.id !== id);
        const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
        set({ notifications: filteredNotifications, unreadCount });
      },

      setUnreadCount: (count) => set({ unreadCount: count }),

      setStats: (stats) => set({ stats }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'notification-store',
    }
  )
); 