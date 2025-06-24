import toast, { ToastOptions } from 'react-hot-toast';

// Track active toasts to prevent duplicates
const activeToasts = new Set<string>();

// Theme colors for Cattleya
const themeColors = {
  primary: {
    light: '#8b5cf6', // Purple
    dark: '#7c3aed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
  },
  success: {
    light: '#10b981', // Emerald
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
  },
  error: {
    light: '#ef4444', // Red
    dark: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
  },
  warning: {
    light: '#f59e0b', // Amber
    dark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
  },
  info: {
    light: '#3b82f6', // Blue
    dark: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
  }
};

// Base toast options with theme
const baseToastOptions: ToastOptions = {
  duration: 4000,
  style: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    minWidth: '300px',
  },
};

// Create a unique key for toast deduplication
const createToastKey = (message: string, type: string = 'default'): string => {
  return `${type}:${message.toLowerCase().trim()}`;
};

// Custom toast functions with deduplication
export const customToast = {
  success: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'success');
    
    if (activeToasts.has(key)) {
      return; // Don't show duplicate
    }
    
    activeToasts.add(key);
    
    const toastId = toast.success(message, {
      ...baseToastOptions,
      ...options,
      style: {
        ...baseToastOptions.style,
        ...options?.style,
        borderLeft: `4px solid ${themeColors.success.light}`,
        background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)`,
      },
      iconTheme: {
        primary: themeColors.success.light,
        secondary: '#ffffff',
      },
    });
    
    // Remove from active toasts when dismissed
    setTimeout(() => {
      activeToasts.delete(key);
    }, 4000);
    
    return toastId;
  },

  error: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'error');
    
    if (activeToasts.has(key)) {
      return; // Don't show duplicate
    }
    
    activeToasts.add(key);
    
    const toastId = toast.error(message, {
      ...baseToastOptions,
      ...options,
      style: {
        ...baseToastOptions.style,
        ...options?.style,
        borderLeft: `4px solid ${themeColors.error.light}`,
        background: `linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)`,
      },
      iconTheme: {
        primary: themeColors.error.light,
        secondary: '#ffffff',
      },
    });
    
    setTimeout(() => {
      activeToasts.delete(key);
    }, 4000);
    
    return toastId;
  },

  warning: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'warning');
    
    if (activeToasts.has(key)) {
      return;
    }
    
    activeToasts.add(key);
    
    const toastId = toast(message, {
      ...baseToastOptions,
      ...options,
      icon: '⚠️',
      style: {
        ...baseToastOptions.style,
        ...options?.style,
        borderLeft: `4px solid ${themeColors.warning.light}`,
        background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)`,
      },
    });
    
    setTimeout(() => {
      activeToasts.delete(key);
    }, 4000);
    
    return toastId;
  },

  info: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'info');
    
    if (activeToasts.has(key)) {
      return;
    }
    
    activeToasts.add(key);
    
    const toastId = toast(message, {
      ...baseToastOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        ...baseToastOptions.style,
        ...options?.style,
        borderLeft: `4px solid ${themeColors.info.light}`,
        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)`,
      },
    });
    
    setTimeout(() => {
      activeToasts.delete(key);
    }, 4000);
    
    return toastId;
  },

  primary: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'primary');
    
    if (activeToasts.has(key)) {
      return;
    }
    
    activeToasts.add(key);
    
    const toastId = toast(message, {
      ...baseToastOptions,
      ...options,
      icon: '🌺',
      style: {
        ...baseToastOptions.style,
        ...options?.style,
        borderLeft: `4px solid ${themeColors.primary.light}`,
        background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)`,
      },
    });
    
    setTimeout(() => {
      activeToasts.delete(key);
    }, 4000);
    
    return toastId;
  },

  // Custom cart-specific toasts
  cart: {
    added: (productName: string) => {
      return customToast.success(`🌺 ${productName} added to cart`, {
        duration: 3000,
      });
    },
    
    removed: (productName: string) => {
      return customToast.error(`🗑️ ${productName} removed from cart`, {
        duration: 3000,
      });
    },
    
    updated: () => {
      return customToast.success('✨ Cart updated successfully', {
        duration: 2000,
      });
    },
    
    cleared: () => {
      return customToast.warning('🧹 Cart cleared', {
        duration: 3000,
      });
    },
    
    error: (action: string) => {
      return customToast.error(`❌ Failed to ${action} cart item`, {
        duration: 4000,
      });
    }
  },

  // Auth-specific toasts
  auth: {
    loginSuccess: () => {
      return customToast.success('🎉 Welcome back!', {
        duration: 3000,
      });
    },
    
    logoutSuccess: () => {
      return customToast.info('👋 Logged out successfully', {
        duration: 3000,
      });
    },
    
    registerSuccess: () => {
      return customToast.success('🎊 Account created successfully!', {
        duration: 4000,
      });
    },
    
    loginError: () => {
      return customToast.error('🔐 Login failed. Please check your credentials.', {
        duration: 4000,
      });
    },
    
    registerError: () => {
      return customToast.error('📝 Registration failed. Please try again.', {
        duration: 4000,
      });
    },

    profileUpdateSuccess: () => {
      return customToast.success('✨ Profile updated successfully!', {
        duration: 3000,
      });
    },

    profileUpdateError: (message: string) => {
      return customToast.error(`❌ ${message}`, {
        duration: 4000,
      });
    },

    passwordChangeSuccess: () => {
      return customToast.success('🔒 Password changed successfully!', {
        duration: 3000,
      });
    },

    passwordChangeError: (message: string) => {
      return customToast.error(`❌ ${message}`, {
        duration: 4000,
      });
    },

    avatarUploadSuccess: () => {
      return customToast.success('🖼️ Avatar uploaded successfully!', {
        duration: 3000,
      });
    },

    avatarUploadError: (message: string) => {
      return customToast.error(`❌ ${message}`, {
        duration: 4000,
      });
    }
  },

  // Wishlist-specific toasts
  wishlist: {
    added: (productName: string) => {
      return customToast.success(`💖 ${productName} added to wishlist`, {
        duration: 3000,
      });
    },
    
    removed: (productName: string) => {
      return customToast.error(`💔 ${productName} removed from wishlist`, {
        duration: 3000,
      });
    },
    
    error: (action: string) => {
      return customToast.error(`❌ Failed to ${action} wishlist item`, {
        duration: 4000,
      });
    }
  },

  // Order-specific toasts
  order: {
    placed: (orderId: string) => {
      return customToast.success(`🎉 Order #${orderId} placed successfully!`, {
        duration: 5000,
      });
    },
    
    error: () => {
      return customToast.error('❌ Failed to place order. Please try again.', {
        duration: 4000,
      });
    }
  },

  // Clear all active toasts
  clear: () => {
    activeToasts.clear();
    toast.dismiss();
  },

  // Clear specific toast by key
  clearByKey: (message: string, type: string = 'default') => {
    const key = createToastKey(message, type);
    activeToasts.delete(key);
  }
};

// Export the original toast for backward compatibility
export { toast };

// Export theme colors for use in other components
export { themeColors }; 