'use client';

import { useState, useEffect } from 'react';
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
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import Link from 'next/link';
import { customToast } from '@/shared/utils/toast';

export default function CustomerCartPage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    cart,
    isLoading,
    checkoutStep,
    shippingAddress,
    paymentMethod,
    orderNotes,
    subtotal,
    shipping,
    tax,
    total,
    fetchCart,
    removeItem,
    updateQuantity,
    setCheckoutStep,
    setShippingAddress,
    setPaymentMethod,
    setOrderNotes,
    calculateTotals,
    placeOrder,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

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

  useEffect(() => {
    calculateTotals();
  }, [cart, calculateTotals]);

  // Fetch cart on component mount only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

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

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleNextStep = () => {
    switch (checkoutStep) {
      case 'cart':
        if (!cart || cart.items.length === 0) {
          customToast.warning('Your cart is empty');
          return;
        }
        setCheckoutStep('shipping');
        break;
      case 'shipping':
        if (!selectedAddress) {
          customToast.warning('Please select a shipping address');
          return;
        }
        setShippingAddress(selectedAddress);
        setCheckoutStep('payment');
        break;
      case 'payment':
        if (!selectedPayment) {
          customToast.warning('Please select a payment method');
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
      customToast.order.placed(result.orderId || 'Order');
      setCheckoutStep('success');
    } else {
      customToast.error(result.error || 'Failed to place order');
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

  const CartStep = () => (
    <div className="space-y-6">
      {!cart || cart.items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <button
            onClick={() => window.location.href = '/products'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Browse Products
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item: any, index: number) => (
             <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-4 flex items-center space-x-4"
            >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                    <img 
                      src={item.product.images[0]?.url || '/placeholder-image.jpg'} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain rounded-md" 
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">${item.product.basePrice.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-md shadow-sm hover:shadow-md hover:from-purple-500 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center"
                    >
                        <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-md shadow-sm hover:shadow-md hover:from-purple-500 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-24 text-right">
                    <p className="font-bold text-lg text-gray-800">${(item.product.basePrice * item.quantity).toFixed(2)}</p>
                </div>
                <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
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
    <div className="space-y-8">
      {/* Order Summary */}
      <div className="bg-fuchsia-50/50 rounded-2xl p-6 border border-fuchsia-100">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Order Summary</h4>
        <div className="space-y-4">
          {cart?.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-gray-800">${(item.product.basePrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-fuchsia-200 pt-4 mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900">Total</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping and Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
          <h5 className="font-semibold text-gray-800 mb-3">Shipping Address</h5>
          <address className="text-sm text-gray-600 not-italic">
            {selectedAddress?.firstName} {selectedAddress?.lastName}<br />
            {selectedAddress?.street}{selectedAddress?.apartment && `, ${selectedAddress.apartment}`}<br />
            {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.zipCode}
          </address>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
          <h5 className="font-semibold text-gray-800 mb-3">Payment Method</h5>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700">
              {selectedPayment?.brand.toUpperCase()} ending in {selectedPayment?.last4}
            </p>
            <p>{selectedPayment?.holderName}</p>
          </div>
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
      <div className="max-w-6xl mx-auto relative">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-white animate-bg-move" />
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Checkout
                </h1>
                <p className="text-gray-600">Complete your purchase securely</p>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="flex items-center space-x-2 text-purple-600"
              >
                <ShoppingCartIcon className="w-8 h-8 drop-shadow-lg" />
                <span className="text-2xl font-bold">{cart?.items.length || 0}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            {/* Animated background for steps */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/30 to-purple-100/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                {Object.entries(stepTitles).map(([step, title], index) => {
                  const isActive = step === checkoutStep;
                  const isCompleted = ['cart', 'shipping', 'payment', 'review'].indexOf(step) < ['cart', 'shipping', 'payment', 'review'].indexOf(checkoutStep);
                  return (
                    <div key={step} className="flex items-center relative">
                      <motion.div 
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all duration-500 border-2 ${
                          isActive 
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl shadow-purple-500/40 border-pink-400 animate-border-glow' 
                            : isCompleted 
                              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white shadow-2xl shadow-green-500/40 border-emerald-400' 
                              : 'bg-white/80 backdrop-blur-sm text-gray-600 border-gray-300 shadow-lg'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {/* Glowing effect for active step */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-lg opacity-50 animate-pulse"></div>
                        )}
                        
                        {/* Step content */}
                        <div className="relative z-10">
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            >
                              <CheckCircleIcon className="w-7 h-7" />
                            </motion.div>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-lg font-bold"
                            >
                              {index + 1}
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Step title with enhanced styling */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="ml-4 text-center"
                      >
                        <span className={`block font-semibold text-sm transition-all duration-300 ${
                          isActive 
                            ? 'text-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' 
                            : isCompleted 
                              ? 'text-green-600' 
                              : 'text-gray-500'
                        }`}>
                          {title}
                        </span>
                        {/* Progress indicator */}
                        <motion.div
                          className={`h-1 mt-2 rounded-full transition-all duration-500 ${
                            isActive 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' 
                              : isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' 
                                : 'bg-gray-200'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: isActive || isCompleted ? '100%' : '0%' }}
                          transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                        />
                      </motion.div>
                      
                      {/* Connecting line */}
                      {index < Object.keys(stepTitles).length - 1 && (
                        <motion.div 
                          className={`w-16 h-1 mx-4 rounded-full transition-all duration-700 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 shadow-lg shadow-green-500/30 animate-bg-move' 
                              : 'bg-gradient-to-r from-gray-200 to-gray-300'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isCompleted ? 1 : 0.3 }}
                          transition={{ delay: index * 0.1 + 0.6, duration: 1 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Progress percentage indicator */}
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Step {['cart', 'shipping', 'payment', 'review', 'success'].indexOf(checkoutStep) + 1} of 5
                  </span>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div 
              className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-8 shadow-2xl shadow-purple-500/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Animated background effects */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Enhanced header with gradient text and icons */}
              <div className="relative z-10 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <motion.h2 
                      className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {stepTitles[checkoutStep]}
                    </motion.h2>
                    <motion.p 
                      className="text-gray-600 font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {checkoutStep === 'cart' && 'Review your items and quantities'}
                      {checkoutStep === 'shipping' && 'Choose your delivery address'}
                      {checkoutStep === 'payment' && 'Select your payment method'}
                      {checkoutStep === 'review' && 'Review your order details'}
                      {checkoutStep === 'success' && 'Your order has been confirmed'}
                    </motion.p>
                  </div>
                  
                  {/* Step-specific icon with animation */}
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {checkoutStep === 'cart' && <ShoppingCartIcon className="w-8 h-8 text-purple-600" />}
                    {checkoutStep === 'shipping' && <TruckIcon className="w-8 h-8 text-purple-600" />}
                    {checkoutStep === 'payment' && <CreditCardIcon className="w-8 h-8 text-purple-600" />}
                    {checkoutStep === 'review' && <CheckCircleIcon className="w-8 h-8 text-purple-600" />}
                    {checkoutStep === 'success' && <CheckCircleIcon className="w-8 h-8 text-green-600" />}
                  </motion.div>
                </div>
                
                {/* Progress bar */}
                <motion.div 
                  className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${(['cart', 'shipping', 'payment', 'review', 'success'].indexOf(checkoutStep) + 1) * 20}%` }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  />
                </motion.div>
              </div>

              <AnimatePresence>
                <motion.div
                  key={checkoutStep}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  {checkoutStep === 'cart' && <CartStep />}
                  {checkoutStep === 'shipping' && <ShippingStep />}
                  {checkoutStep === 'payment' && <PaymentStep />}
                  {checkoutStep === 'review' && <ReviewStep />}
                  {checkoutStep === 'success' && <SuccessStep />}
                </motion.div>
              </AnimatePresence>

              {/* Enhanced Navigation Buttons */}
              {checkoutStep !== 'success' && (
                <motion.div 
                  className="flex items-center justify-between mt-8 pt-6 border-t border-white/30 relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {checkoutStep === 'cart' ? (
                     <Link href="/products">
                        <motion.button
                          className="flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm border border-white/40 text-gray-700 rounded-2xl hover:bg-white/90 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 font-semibold"
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ArrowLeftIcon className="w-5 h-5 mr-3" />
                          Continue Shopping
                        </motion.button>
                     </Link>
                  ) : (
                    <motion.button
                      onClick={handlePrevStep}
                      className="flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm border border-white/40 text-gray-700 rounded-2xl hover:bg-white/90 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02, x: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeftIcon className="w-5 h-5 mr-3" />
                      Back
                    </motion.button>
                  )}

                  <motion.button
                    onClick={handleNextStep}
                    disabled={isLoading || (checkoutStep === 'cart' && !cart?.items.length)}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center">
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Processing...
                        </div>
                      ) : checkoutStep === 'review' ? (
                        <>
                          <ShieldCheckIcon className="w-5 h-5 mr-3" />
                          Place Order
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          {checkoutStep !== 'success' && (
            <div className="lg:col-span-1">
              <motion.div 
                className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 sticky top-6 shadow-2xl shadow-purple-500/10 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Animated background effects */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
                
                {/* Enhanced header */}
                <div className="relative z-10 mb-6">
                  <motion.h3 
                    className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Order Summary
                  </motion.h3>
                  <motion.div 
                    className="w-full bg-gray-200 rounded-full h-1 overflow-hidden"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    />
                  </motion.div>
                </div>
                
                {/* Order details with enhanced styling */}
                <div className="relative z-10 space-y-4 mb-6">
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-gray-600 font-medium">Subtotal ({cart?.items.length || 0} items)</span>
                    <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="font-bold text-gray-800">
                      {shipping === 0 ? (
                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                          Free
                        </span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-gray-600 font-medium">Tax</span>
                    <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="border-t-2 border-white/40 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl border border-purple-200/30">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Enhanced promotional messages */}
                {subtotal < 100 && (
                  <motion.div 
                    className="bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-200/50 rounded-2xl p-4 mb-4 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <TruckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">
                          Free Shipping Available!
                        </p>
                        <p className="text-xs text-blue-600">
                          Add ${(100 - subtotal).toFixed(2)} more for free shipping
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  className="bg-gradient-to-r from-green-50/90 to-emerald-50/90 border border-green-200/50 rounded-2xl p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Secure Checkout
                      </p>
                      <p className="text-xs text-green-600">
                        256-bit SSL encryption
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      {/* Dazzling CSS Animations */}
      <style jsx global>{`
        @keyframes border-glow {
          0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.3), 0 0 0 0 rgba(236,72,153,0.3); }
          50% { box-shadow: 0 0 16px 4px rgba(168,85,247,0.5), 0 0 32px 8px rgba(236,72,153,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.3), 0 0 0 0 rgba(236,72,153,0.3); }
        }
        .animate-border-glow {
          animation: border-glow 2.5s infinite;
        }
        @keyframes bg-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-move {
          background-size: 200% 200%;
          animation: bg-move 8s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
      `}</style>
    </CustomerLayout>
  );
} 