import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartApi, Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../../infrastructure/api/cartApi';
import { customToast } from '../../../shared/utils/toast';
import { useAuthStore } from './useAuthStore';

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

interface CartStore {
  // Cart State
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  
  // Checkout State
  checkoutStep: 'cart' | 'shipping' | 'payment' | 'review' | 'success';
  shippingAddress: ShippingAddress | null;
  paymentMethod: PaymentMethod | null;
  orderNotes: string;
  
  // Pricing
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  
  // Cart Actions
  fetchCart: () => Promise<void>;
  addItem: (data: AddToCartRequest) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: (skipApiCall?: boolean) => Promise<void>;
  toggleCart: () => void;
  
  // Checkout Actions
  setCheckoutStep: (step: CartStore['checkoutStep']) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrderNotes: (notes: string) => void;
  calculateTotals: (appliedDiscount?: number) => void;
  
  // Order Actions
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  
  // Utility
  getItemCount: () => number;
  hasItem: (productId: string) => boolean;
  getItem: (productId: string) => CartItem | undefined;
  
  // Authentication handling
  handleAuthStateChange: (isAuthenticated: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cart: null,
      isOpen: false,
      isLoading: false,
      checkoutStep: 'cart',
      shippingAddress: null,
      paymentMethod: null,
      orderNotes: '',
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,

      // Cart Actions
      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const cart = await CartApi.getCart();
          set({ cart });
          get().calculateTotals();
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
          
          // If unauthorized (401), clear cart and don't show error
          if (error.response?.status === 401) {
            set({ 
              cart: null,
              checkoutStep: 'cart',
              shippingAddress: null,
              paymentMethod: null,
              orderNotes: '',
              subtotal: 0,
              shipping: 0,
              tax: 0,
              discount: 0,
              total: 0,
              isLoading: false
            });
            return;
          }
          
          // For other errors, show error message
          customToast.error('Failed to load cart');
          set({ isLoading: false });
        }
      },

      addItem: async (data) => {
        // Check authentication first
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          customToast.auth.loginError();
          return;
        }

        try {
          set({ isLoading: true });
          const cart = await CartApi.addToCart(data);
          set({ cart });
          get().calculateTotals();
          customToast.cart.added('Product');
        } catch (error: any) {
          console.error('Failed to add item to cart:', error);
          
          // If unauthorized (401), redirect to login
          if (error.response?.status === 401) {
            customToast.auth.loginError();
            set({ isLoading: false });
            return;
          }
          
          // Provide specific error messages based on the error
          if (error.response?.status === 400) {
            customToast.error(error.response.data?.message || 'Invalid request');
          } else if (error.response?.status === 404) {
            customToast.error('Product not found');
          } else if (error.response?.status === 409) {
            customToast.warning('Product already in cart');
          } else {
            customToast.cart.error('add');
          }
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        // Check authentication first
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          customToast.auth.loginError();
          return;
        }

        try {
          set({ isLoading: true });
          await CartApi.removeFromCart(itemId);
          await get().fetchCart(); // Refresh cart data
          customToast.cart.removed('Item');
        } catch (error: any) {
          console.error('Failed to remove item from cart:', error);
          
          // If unauthorized (401), just clear local state without API call
          if (error.response?.status === 401) {
            set({ 
              cart: null,
              isLoading: false 
            });
            return;
          }
          
          customToast.cart.error('remove');
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        // Check authentication first
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          customToast.auth.loginError();
          return;
        }

        try {
          set({ isLoading: true });
          const cart = await CartApi.updateCartItem(itemId, { quantity });
          set({ cart });
          get().calculateTotals();
          customToast.cart.updated();
        } catch (error: any) {
          console.error('Failed to update cart item:', error);
          
          // If unauthorized (401), just clear local state without API call
          if (error.response?.status === 401) {
            set({ 
              cart: null,
              isLoading: false 
            });
            return;
          }
          
          customToast.cart.error('update');
          set({ isLoading: false });
        }
      },

      clearCart: async (skipApiCall = false) => {
        try {
          if (!skipApiCall) {
            // Check authentication first (only when making API call)
            const { isAuthenticated } = useAuthStore.getState();
            if (!isAuthenticated) {
              customToast.auth.loginError();
              return;
            }
            
            set({ isLoading: true });
            await CartApi.clearCart();
          }
          set({ 
            cart: null,
            checkoutStep: 'cart',
            shippingAddress: null,
            paymentMethod: null,
            orderNotes: '',
            subtotal: 0,
            shipping: 0,
            tax: 0,
            discount: 0,
            total: 0,
            isLoading: false
          });
          if (!skipApiCall) {
            customToast.cart.cleared();
          }
        } catch (error) {
          console.error('Failed to clear cart:', error);
          if (!skipApiCall) {
            customToast.cart.error('clear');
          }
          set({ isLoading: false });
        }
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      // Checkout Actions
      setCheckoutStep: (step) => {
        set({ checkoutStep: step });
      },

      setShippingAddress: (address) => {
        set({ shippingAddress: address });
        get().calculateTotals();
      },

      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      setOrderNotes: (notes) => {
        set({ orderNotes: notes });
      },

      calculateTotals: (appliedDiscount = 0) => {
        const { cart, shippingAddress } = get();
        const subtotal = cart?.totalValue || 0;
        
        // Calculate shipping (free over $100, otherwise $10)
        const shipping = subtotal >= 100 ? 0 : 10;
        
        // Calculate tax (8% for now, could be based on shipping address)
        const tax = subtotal * 0.08;
        
        // Use the applied discount
        const discount = appliedDiscount;
        
        const total = subtotal + shipping + tax - discount;

        set({ subtotal, shipping, tax, discount, total });
      },

      placeOrder: async () => {
        const { cart, shippingAddress, paymentMethod, orderNotes, total } = get();
        
        if (!cart?.items.length || !shippingAddress || !paymentMethod) {
          return { success: false, error: 'Missing required information' };
        }

        set({ isLoading: true });

        try {
          // Mock API call - replace with actual order API integration
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const orderId = `ORD-${Date.now()}`;
          
          // Clear cart after successful order
          await get().clearCart();
          set({ checkoutStep: 'success', isLoading: false });
          
          return { success: true, orderId };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Failed to place order' };
        }
      },

      // Utility Functions
      getItemCount: () => {
        const { cart } = get();
        return cart?.totalItems || 0;
      },

      hasItem: (productId) => {
        const { cart } = get();
        return cart?.items.some(item => item.product.id === productId) || false;
      },

      getItem: (productId) => {
        const { cart } = get();
        return cart?.items.find(item => item.product.id === productId);
      },

      // Authentication handling
      handleAuthStateChange: (isAuthenticated) => {
        if (!isAuthenticated) {
          get().clearCart(true); // Skip API call during logout
        }
      }
    }),
    {
      name: 'cattleya-cart-storage',
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod
      })
    }
  )
); 