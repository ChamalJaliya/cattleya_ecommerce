import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
  performance: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

interface AppState {
  // Application state
  isLoading: boolean;
  isOnline: boolean;
  isMaintenance: boolean;
  maintenanceMessage: string;
  
  // Settings
  settings: AppSettings;
  
  // Feature flags
  features: {
    reviews: boolean;
    wishlist: boolean;
    comparison: boolean;
    loyalty: boolean;
    notifications: boolean;
  };
  
  // Performance metrics
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errors: Array<{
      message: string;
      timestamp: number;
      url: string;
    }>;
  };
  
  // Actions
  setLoading: (loading: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  setMaintenance: (maintenance: boolean, message?: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Feature actions
  updateFeatures: (features: Partial<AppState['features']>) => void;
  
  // Performance actions
  trackPageLoad: (loadTime: number) => void;
  trackApiResponse: (responseTime: number) => void;
  trackError: (error: Error, url?: string) => void;
  clearErrors: () => void;
  
  // Utility actions
  initializeApp: () => Promise<void>;
  checkForUpdates: () => Promise<boolean>;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
  accessibility: {
    highContrast: false,
    fontSize: 'medium',
    reducedMotion: false,
  },
  performance: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
  },
};

const defaultFeatures = {
  reviews: true,
  wishlist: true,
  comparison: true,
  loyalty: true,
  notifications: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      isOnline: navigator.onLine,
      isMaintenance: false,
      maintenanceMessage: '',
      
      settings: defaultSettings,
      features: defaultFeatures,
      
      performance: {
        pageLoadTime: 0,
        apiResponseTime: 0,
        errors: [],
      },
      
      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      setMaintenance: (isMaintenance, message = '') => set({ 
        isMaintenance, 
        maintenanceMessage: message 
      }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      resetSettings: () => set({ settings: defaultSettings }),
      
      updateFeatures: (newFeatures) => set((state) => ({
        features: { ...state.features, ...newFeatures }
      })),
      
      trackPageLoad: (loadTime) => set((state) => ({
        performance: {
          ...state.performance,
          pageLoadTime: loadTime,
        }
      })),
      
      trackApiResponse: (responseTime) => set((state) => ({
        performance: {
          ...state.performance,
          apiResponseTime: responseTime,
        }
      })),
      
      trackError: (error, url = window.location.href) => set((state) => ({
        performance: {
          ...state.performance,
          errors: [
            ...state.performance.errors,
            {
              message: error.message,
              timestamp: Date.now(),
              url,
            }
          ].slice(-50), // Keep only last 50 errors
        }
      })),
      
      clearErrors: () => set((state) => ({
        performance: {
          ...state.performance,
          errors: [],
        }
      })),
      
      initializeApp: async () => {
        set({ isLoading: true });
        
        try {
          // Check online status
          set({ isOnline: navigator.onLine });
          
          // Listen for online/offline events
          window.addEventListener('online', () => get().setOnlineStatus(true));
          window.addEventListener('offline', () => get().setOnlineStatus(false));
          
          // Check for maintenance mode
          try {
            const response = await fetch('/api/health');
            if (response.status === 503) {
              const data = await response.json();
              get().setMaintenance(true, data.message || 'Maintenance in progress');
            }
          } catch (error) {
            // Ignore health check errors
          }
          
          // Load feature flags from API
          try {
            const response = await fetch('/api/features');
            if (response.ok) {
              const features = await response.json();
              get().updateFeatures(features);
            }
          } catch (error) {
            console.warn('Failed to load feature flags:', error);
          }
          
          // Apply theme
          const { settings } = get();
          applyTheme(settings.theme);
          
        } catch (error) {
          console.error('Failed to initialize app:', error);
          get().trackError(error as Error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      checkForUpdates: async () => {
        try {
          const response = await fetch('/api/version');
          if (response.ok) {
            const { version } = await response.json();
            const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
            
            if (version !== currentVersion) {
              // Show update notification
              return true;
            }
          }
        } catch (error) {
          console.warn('Failed to check for updates:', error);
        }
        
        return false;
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        settings: state.settings,
        features: state.features,
        performance: {
          errors: state.performance.errors,
        },
      }),
    }
  )
);

// Theme application utility
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { settings } = useAppStore.getState();
    if (settings.theme === 'system') {
      applyTheme('system');
    }
  });
}

// Export selectors for better performance
export const useAppSettings = () => useAppStore((state) => state.settings);
export const useAppFeatures = () => useAppStore((state) => state.features);
export const useAppPerformance = () => useAppStore((state) => state.performance);
export const useAppStatus = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  isOnline: state.isOnline,
  isMaintenance: state.isMaintenance,
  maintenanceMessage: state.maintenanceMessage,
})); 