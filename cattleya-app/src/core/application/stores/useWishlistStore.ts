import { create } from 'zustand';
import { WishlistApi, Wishlist, WishlistItem } from '../../infrastructure/api/wishlistApi';
import { customToast } from '../../../shared/utils/toast';
import { useAuthStore } from './useAuthStore';

interface WishlistStore {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: (skipApiCall?: boolean) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    // Check authentication first
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      // Don't make API call if not authenticated
      set({ wishlist: null, isLoading: false, error: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const wishlist = await WishlistApi.getWishlist();
      set({ wishlist, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error);
      
      // If unauthorized (401), clear wishlist and don't show error
      if (error.response?.status === 401) {
        set({ wishlist: null, isLoading: false, error: null });
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch wishlist';
      set({ error: errorMessage, isLoading: false });
      customToast.error(errorMessage);
    }
  },

  addToWishlist: async (productId: string) => {
    // Check authentication first
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      customToast.auth.loginError();
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await WishlistApi.addToWishlist(productId);
      // Refresh wishlist
      await get().fetchWishlist();
      customToast.wishlist.added('Product');
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
      
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        customToast.auth.loginError();
        set({ isLoading: false });
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
      set({ error: errorMessage, isLoading: false });
      customToast.wishlist.error('add');
    }
  },

  removeFromWishlist: async (productId: string) => {
    // Check authentication first
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      customToast.auth.loginError();
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await WishlistApi.removeFromWishlist(productId);
      // Update local state
      const { wishlist } = get();
      if (wishlist) {
        const updatedWishlist = {
          ...wishlist,
          items: wishlist.items.filter(item => item.product.id !== productId),
          totalItems: wishlist.items.filter(item => item.product.id !== productId).length,
          totalValue: wishlist.items
            .filter(item => item.product.id !== productId)
            .reduce((sum, item) => sum + (item.product.displayPrice || 0), 0)
        };
        set({ wishlist: updatedWishlist, isLoading: false });
      }
      customToast.wishlist.removed('Product');
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error);
      
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        customToast.auth.loginError();
        set({ isLoading: false });
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
      set({ error: errorMessage, isLoading: false });
      customToast.wishlist.error('remove');
    }
  },

  clearWishlist: async (skipApiCall = false) => {
    try {
      if (!skipApiCall) {
        // Check authentication first (only when making API call)
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          customToast.auth.loginError();
          return;
        }
        
        set({ isLoading: true, error: null });
        await WishlistApi.clearWishlist();
      }
      
      set({ 
        wishlist: { totalItems: 0, totalValue: 0, items: [] }, 
        isLoading: false 
      });
      
      if (!skipApiCall) {
        customToast.success('Wishlist cleared');
      }
    } catch (error: any) {
      console.error('Failed to clear wishlist:', error);
      
      if (!skipApiCall) {
        // If unauthorized (401), redirect to login
        if (error.response?.status === 401) {
          customToast.auth.loginError();
          set({ isLoading: false });
          return;
        }
        
        const errorMessage = error.response?.data?.message || 'Failed to clear wishlist';
        set({ error: errorMessage, isLoading: false });
        customToast.error(errorMessage);
      } else {
        set({ isLoading: false });
      }
    }
  },

  isInWishlist: (productId: string) => {
    const { wishlist } = get();
    return wishlist?.items?.some(item => item.product.id === productId) || false;
  },
})); 