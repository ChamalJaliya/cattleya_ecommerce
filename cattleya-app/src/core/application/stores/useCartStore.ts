import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartApi, Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../../infrastructure/api/cartApi';
import { toast } from 'react-hot-toast';

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
  clearCart: () => Promise<void>;
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
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          toast.error('Failed to load cart');
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (data) => {
        try {
          set({ isLoading: true });
          const cart = await CartApi.addToCart(data);
          set({ cart });
          get().calculateTotals();
          toast.success('Added to cart');
        } catch (error: any) {
          console.error('Failed to add item to cart:', error);
          
          // Provide specific error messages based on the error
          if (error.response?.status === 400) {
            toast.error('Invalid item data. Please try again.');
          } else if (error.response?.status === 500) {
            toast.error('Server error. Please try again in a moment.');
          } else if (error.message?.includes('duplicate') || error.message?.includes('constraint')) {
            toast.error('Item already in cart. Quantity updated.');
          } else {
            toast.error('Failed to add item to cart. Please try again.');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          await CartApi.removeFromCart(itemId);
          await get().fetchCart(); // Refresh cart data
          toast.success('Item removed from cart');
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          toast.error('Failed to remove item from cart');
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        try {
          set({ isLoading: true });
          const cart = await CartApi.updateCartItem(itemId, { quantity });
          set({ cart });
          get().calculateTotals();
          toast.success('Cart updated');
        } catch (error) {
          console.error('Failed to update cart item:', error);
          toast.error('Failed to update cart');
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true });
          await CartApi.clearCart();
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
            total: 0
          });
          toast.success('Cart cleared');
        } catch (error) {
          console.error('Failed to clear cart:', error);
          toast.error('Failed to clear cart');
        } finally {
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