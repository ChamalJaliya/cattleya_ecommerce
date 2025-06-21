'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';
import { useCartStore, CartItem } from '@/core/application/stores/useCartStore';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import toast from 'react-hot-toast';

// Enhanced Mock Data with Images
const mockItems: Omit<CartItem, 'id'>[] = [
    {
      productId: 'prod_001',
      name: 'Enchanted Orchid',
      price: 49.99,
      quantity: 1,
      image: 'https://plus.unsplash.com/premium_photo-1677692482352-935574581729?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'A rare, beautiful orchid that blooms year-round.',
      sku: 'CAT-ORC-001',
      inStock: true,
      maxQuantity: 5,
    },
    {
      productId: 'prod_002',
      name: 'Sun-Kissed Lily',
      price: 29.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1594955358498-c678a3a4115d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Bright yellow lilies that bring sunshine indoors.',
      sku: 'CAT-LIL-002',
      inStock: true,
      maxQuantity: 10,
    },
    {
      productId: 'prod_003',
      name: 'Midnight Rose',
      price: 35.50,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1560263816-d704d83cce0f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'A deep red rose with velvety petals.',
      sku: 'CAT-ROS-003',
      inStock: true,
      maxQuantity: 8,
    },
  ];

export default function CustomerCartPage() {
  const { user } = useAuthStore();
  const {
    items,
    isLoading,
    checkoutStep,
    shippingAddress,
    paymentMethod,
    orderNotes,
    subtotal,
    shipping,
    tax,
    total,
    discount,
    removeItem,
    updateQuantity,
    setCheckoutStep,
    setShippingAddress,
    setPaymentMethod,
    setOrderNotes,
    calculateTotals,
    placeOrder,
    clearCart,
    addItem,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');

  // Mock addresses and payment methods (in real app, fetch from user profile)
  const mockAddresses = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com',
      isDefault: true
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Smith',
      street: '456 Business Ave',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      email: 'john@example.com',
      isDefault: false
    }
  ];

  const mockPaymentMethods = [
    {
      id: '1',
      type: 'credit' as const,
      brand: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2027',
      holderName: 'John Smith',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit' as const,
      brand: 'mastercard',
      last4: '5555',
      expiryMonth: '09',
      expiryYear: '2026',
      holderName: 'John Smith',
      isDefault: false
    }
  ];

  // Replace store's initial empty items with our mock data for demonstration
  useEffect(() => {
    // Clear the cart and add mock items only once
    if (items.length === 0 && mockItems.length > 0) {
      mockItems.forEach(item => addItem(item));
    }
  }, [addItem, items.length]);

  useEffect(() => {
    calculateTotals(discount);
  }, [items, discount, calculateTotals]);

  useEffect(() => {
    // Set default selections
    if (mockAddresses.length > 0 && !selectedAddress) {
      const defaultAddr = mockAddresses.find(addr => addr.isDefault) || mockAddresses[0];
      setSelectedAddress(defaultAddr);
    }
    if (mockPaymentMethods.length > 0 && !selectedPayment) {
      const defaultPayment = mockPaymentMethods.find(pm => pm.isDefault) || mockPaymentMethods[0];
      setSelectedPayment(defaultPayment);
    }
  }, [selectedAddress, selectedPayment]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
      toast.success('Quantity updated!');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.error('Item removed from cart');
  };

  const handleNextStep = () => {
    switch (checkoutStep) {
      case 'cart':
        if (items.length === 0) {
          toast.error('Your cart is empty');
          return;
        }
        setCheckoutStep('shipping');
        break;
      case 'shipping':
        if (!selectedAddress) {
          toast.error('Please select a shipping address');
          return;
        }
        setShippingAddress(selectedAddress);
        setCheckoutStep('payment');
        break;
      case 'payment':
        if (!selectedPayment) {
          toast.error('Please select a payment method');
          return;
        }
        setPaymentMethod(selectedPayment);
        setCheckoutStep('review');
        break;
      case 'review':
        handlePlaceOrder();
        break;
    }
  };

  const handlePrevStep = () => {
    switch (checkoutStep) {
      case 'shipping':
        setCheckoutStep('cart');
        break;
      case 'payment':
        setCheckoutStep('shipping');
        break;
      case 'review':
        setCheckoutStep('payment');
        break;
    }
  };

  const handlePlaceOrder = async () => {
    const result = await placeOrder();
    if (result.success) {
      toast.success('Order placed successfully!');
      setCheckoutStep('success');
    } else {
      toast.error(result.error || 'Failed to place order');
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'CATTLEYA10') {
      const calculatedDiscount = subtotal * 0.10;
      calculateTotals(calculatedDiscount);
      toast.success('Coupon applied! You get 10% off.');
    } else {
      toast.error('Invalid coupon code.');
    }
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  const stepTitles = {
    cart: 'Shopping Cart',
    shipping: 'Shipping Address',
    payment: 'Payment Method',
    review: 'Order Review',
    success: 'Order Confirmed'
  };

  const EmptyCart = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-20 col-span-3"
    >
      <div className="w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <ShoppingCartIcon className="w-12 h-12 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your Cart is a Blank Canvas</h3>
      <p className="text-gray-600 mb-8">Fill it with beautiful flowers and amazing plants!</p>
      <button
        onClick={() => window.location.href = '/products'}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105"
      >
        Start Shopping
      </button>
    </motion.div>
  );

  const CartStep = () => (
    <div className="space-y-6">
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 p-4 flex items-center space-x-4 shadow-md shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow duration-300"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-500 mb-1">{item.sku}</p>
                <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                  <MinusIcon className="w-4 h-4 text-gray-700" />
                </button>
                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                  <PlusIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <p className="font-bold text-lg w-20 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => handleRemoveItem(item.id)} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 transition-all">
                <TrashIcon className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const ShippingStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAddresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedAddress(address)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedAddress?.id === address.id
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  {address.street}, {address.city}
                </span>
              </div>
              {selectedAddress?.id === address.id && (
                <CheckCircleIcon className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {address.firstName} {address.lastName}<br />
              {address.street}{address.apartment && `, ${address.apartment}`}<br />
              {address.city}, {address.state} {address.zipCode}<br />
              {address.country}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPaymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPayment(method)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedPayment?.id === method.id
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  {method.brand.toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">
                  •••• {method.last4}
                </span>
              </div>
              {selectedPayment?.id === method.id && (
                <CheckCircleIcon className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {method.holderName}<br />
              Expires {method.expiryMonth}/{method.expiryYear}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-purple-200 pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-purple-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 p-4">
          <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
          <p className="text-sm text-gray-600">
            {selectedAddress?.firstName} {selectedAddress?.lastName}<br />
            {selectedAddress?.street}{selectedAddress?.apartment && `, ${selectedAddress.apartment}`}<br />
            {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.zipCode}
          </p>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 p-4">
          <h5 className="font-medium text-gray-900 mb-2">Payment Method</h5>
          <p className="text-sm text-gray-600">
            {selectedPayment?.brand.toUpperCase()} •••• {selectedPayment?.last4}<br />
            {selectedPayment?.holderName}
          </p>
        </div>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircleIcon className="w-8 h-8 text-green-600" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="font-mono text-lg font-bold text-purple-600">ORD-{Date.now()}</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/customer/orders'}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Track Your Order
          </button>
          
          <button
            onClick={() => window.location.href = '/products'}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <CustomerLayout>
      <div className="bg-gray-50/50 min-h-screen">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Shopping Cart
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          <AnimatePresence>
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Cart Items */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 space-y-4"
                >
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 p-4 flex items-center space-x-4 shadow-md shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow duration-300"
                      >
                        <div className="w-24 h-24 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500 mb-1">{item.sku}</p>
                          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                            <MinusIcon className="w-4 h-4 text-gray-700" />
                          </button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                            <PlusIcon className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        <p className="font-bold text-lg w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button onClick={() => handleRemoveItem(item.id)} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 transition-all">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1 sticky top-24"
                >
                  <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl shadow-purple-500/10 p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Order Summary</h2>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                       <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Coupon Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow w-full bg-white/50 border-2 border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                          <button 
                            onClick={handleApplyCoupon}
                            disabled={!couponCode}
                            className="bg-purple-200 text-purple-800 font-semibold px-4 rounded-lg hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                    </div>

                    <button
                      onClick={() => toast.success('Redirecting to checkout!')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShieldCheckIcon className="w-5 h-5" />
                      Proceed to Checkout
                    </button>
                    
                     <button
                      onClick={clearCart}
                      className="w-full text-sm text-gray-500 hover:text-red-600 pt-2 transition-colors"
                    >
                      Clear Cart
                    </button>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </CustomerLayout>
  );
} 