import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  variant?: {
    size?: string;
    color?: string;
    type?: string;
  };
  quantity: number;
  inStock: boolean;
  maxQuantity: number;
}

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
  items: CartItem[];
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
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Checkout Actions
  setCheckoutStep: (step: CartStore['checkoutStep']) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrderNotes: (notes: string) => void;
  calculateTotals: () => void;
  
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
      items: [],
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
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(item => 
          item.productId === newItem.productId && 
          JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
        );

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + (newItem.quantity || 1);
          const maxQuantity = existingItem.maxQuantity;
          
          set({
            items: items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: Math.min(newQuantity, maxQuantity) }
                : item
            )
          });
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            quantity: newItem.quantity || 1
          };
          
          set({ items: [...items, cartItem] });
        }
        
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) });
        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
              : item
          )
        });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
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

      calculateTotals: () => {
        const { items, shippingAddress } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate shipping (free over $100, otherwise $10)
        const shipping = subtotal >= 100 ? 0 : 10;
        
        // Calculate tax (8% for now, could be based on shipping address)
        const tax = subtotal * 0.08;
        
        // Discount logic (could be applied here)
        const discount = 0;
        
        const total = subtotal + shipping + tax - discount;

        set({ subtotal, shipping, tax, discount, total });
      },

      placeOrder: async () => {
        const { items, shippingAddress, paymentMethod, orderNotes, total } = get();
        
        if (!items.length || !shippingAddress || !paymentMethod) {
          return { success: false, error: 'Missing required information' };
        }

        set({ isLoading: true });

        try {
          // Mock API call - replace with actual API integration
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const orderId = `ORD-${Date.now()}`;
          
          // Clear cart after successful order
          get().clearCart();
          set({ checkoutStep: 'success', isLoading: false });
          
          return { success: true, orderId };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Failed to place order' };
        }
      },

      // Utility Functions
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      hasItem: (productId) => {
        return get().items.some(item => item.productId === productId);
      },

      getItem: (productId) => {
        return get().items.find(item => item.productId === productId);
      }
    }),
    {
      name: 'cattleya-cart-storage',
      partialize: (state) => ({
        items: state.items,
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod
      })
    }
  )
); 