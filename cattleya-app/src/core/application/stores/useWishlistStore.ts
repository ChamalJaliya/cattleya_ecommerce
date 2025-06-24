import { create } from 'zustand';
import { WishlistApi, Wishlist, WishlistItem } from '../../infrastructure/api/wishlistApi';
import toast from 'react-hot-toast';

interface WishlistStore {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true, error: null });
      const wishlist = await WishlistApi.getWishlist();
      set({ wishlist, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wishlist';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      set({ isLoading: true, error: null });
      await WishlistApi.addToWishlist(productId);
      // Refresh wishlist
      await get().fetchWishlist();
      toast.success('Added to wishlist');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  removeFromWishlist: async (productId: string) => {
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
      toast.success('Removed from wishlist');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from wishlist';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  clearWishlist: async () => {
    try {
      set({ isLoading: true, error: null });
      await WishlistApi.clearWishlist();
      set({ 
        wishlist: { totalItems: 0, totalValue: 0, items: [] }, 
        isLoading: false 
      });
      toast.success('Wishlist cleared');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear wishlist';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  isInWishlist: (productId: string) => {
    const { wishlist } = get();
    return wishlist?.items?.some(item => item.product.id === productId) || false;
  },
})); 