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
import toast from 'react-hot-toast';

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
    removeItem,
    updateQuantity,
    setCheckoutStep,
    setShippingAddress,
    setPaymentMethod,
    setOrderNotes,
    calculateTotals,
    placeOrder
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
  }, [items, calculateTotals]);

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
      removeItem(itemId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success('Item removed from cart');
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
      {items.length === 0 ? (
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
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌺</span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">${item.price.toFixed(2)} each</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
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
      <div className="max-w-6xl mx-auto">
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
              <div className="flex items-center space-x-2 text-purple-600">
                <ShoppingCartIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">{items.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Object.entries(stepTitles).map(([step, title], index) => {
              const isActive = step === checkoutStep;
              const isCompleted = ['cart', 'shipping', 'payment', 'review'].indexOf(step) < ['cart', 'shipping', 'payment', 'review'].indexOf(checkoutStep);
              
              return (
                <div key={step} className="flex items-center">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                        : isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                          : 'bg-gray-200 text-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                  </motion.div>
                  <span className={`ml-3 font-medium transition-colors duration-300 ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {title}
                  </span>
                  {index < Object.keys(stepTitles).length - 1 && (
                    <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl shadow-purple-500/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                {stepTitles[checkoutStep]}
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={checkoutStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {checkoutStep === 'cart' && <CartStep />}
                  {checkoutStep === 'shipping' && <ShippingStep />}
                  {checkoutStep === 'payment' && <PaymentStep />}
                  {checkoutStep === 'review' && <ReviewStep />}
                  {checkoutStep === 'success' && <SuccessStep />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              {checkoutStep !== 'success' && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    onClick={handlePrevStep}
                    disabled={checkoutStep === 'cart'}
                    className="flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </motion.button>

                  <motion.button
                    onClick={handleNextStep}
                    disabled={isLoading || (checkoutStep === 'cart' && items.length === 0)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : checkoutStep === 'review' ? (
                      'Place Order'
                    ) : (
                      <>
                        Continue
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          {checkoutStep !== 'success' && (
            <div className="lg:col-span-1">
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sticky top-6 shadow-xl shadow-purple-500/5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center">
                      <TruckIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Secure checkout with 256-bit SSL encryption
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 