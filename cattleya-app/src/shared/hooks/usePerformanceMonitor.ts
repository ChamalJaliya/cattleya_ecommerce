import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface ErrorMetrics {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface PerformanceMonitorConfig {
  enableRealUserMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableWebVitals?: boolean;
  sampleRate?: number; // 0-1, percentage of users to monitor
  endpoint?: string;
}

class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorMetrics[] = [];
  private isEnabled: boolean;

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enableRealUserMonitoring: true,
      enableErrorTracking: true,
      enableWebVitals: true,
      sampleRate: 0.1, // 10% of users
      endpoint: '/api/analytics/performance',
      ...config,
    };

    // Enable monitoring based on sample rate
    this.isEnabled = Math.random() < this.config.sampleRate!;
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    try {
      if (this.config.enableErrorTracking) {
        this.setupErrorTracking();
      }

      if (this.config.enableWebVitals && typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        this.setupWebVitals();
      }

      if (this.config.enableRealUserMonitoring) {
        this.setupRealUserMonitoring();
      }
    } catch (error) {
      console.warn('Failed to initialize performance monitor:', error);
    }
  }

  private setupErrorTracking() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  private setupWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        if (fcp) {
          this.metrics.push({
            pageLoadTime: 0,
            firstContentfulPaint: fcp.startTime,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            timeToInteractive: 0,
          });
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        if (lcp) {
          this.metrics.push({
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: lcp.startTime,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            timeToInteractive: 0,
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        this.metrics.push({
          pageLoadTime: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: cls,
          firstInputDelay: 0,
          timeToInteractive: 0,
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.push({
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: (entry as any).processingStart - entry.startTime,
            timeToInteractive: 0,
          });
        }
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('Failed to setup Web Vitals:', error);
    }
  }

  private setupRealUserMonitoring() {
    if (typeof window === 'undefined') return;

    // Page load time
    window.addEventListener('load', () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.push({
            pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            timeToInteractive: this.calculateTimeToInteractive(),
          });
        }
      } catch (error) {
        console.warn('Failed to track page load time:', error);
      }
    });
  }

  private getDefaultMetrics(): Partial<PerformanceMetrics> {
    return {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
    };
  }

  private calculateTimeToInteractive(): number {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0;
    } catch (error) {
      console.warn('Failed to calculate TTI:', error);
      return 0;
    }
  }

  private trackError(error: ErrorMetrics) {
    this.errors.push(error);
    this.sendMetrics();
  }

  private async sendMetrics() {
    if (!this.config.endpoint) return;

    try {
      const payload = {
        metrics: this.metrics,
        errors: this.errors,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
      };

      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Clear sent metrics
      this.metrics = [];
      this.errors = [];
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user?.id || null;
      }
    } catch (error) {
      console.warn('Failed to get user ID:', error);
    }
    return null;
  }

  public trackCustomMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.isEnabled) return;

    this.metrics.push({
      ...this.getDefaultMetrics(),
      [name]: value,
    } as any);
  }

  public trackCustomError(error: Error, context?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.trackError({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    });
  }
}

// Global instance
let performanceMonitor: PerformanceMonitor | null = null;

export const usePerformanceMonitor = (config?: PerformanceMonitorConfig) => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current && typeof window !== 'undefined') {
      monitorRef.current = new PerformanceMonitor(config);
      performanceMonitor = monitorRef.current;
    }
  }, [config]);

  const trackCustomMetric = useCallback((name: string, value: number, tags?: Record<string, string>) => {
    monitorRef.current?.trackCustomMetric(name, value, tags);
  }, []);

  const trackCustomError = useCallback((error: Error, context?: Record<string, any>) => {
    monitorRef.current?.trackCustomError(error, context);
  }, []);

  return {
    trackCustomMetric,
    trackCustomError,
  };
};

// Export global instance for use outside of React components
export const getPerformanceMonitor = () => performanceMonitor; 