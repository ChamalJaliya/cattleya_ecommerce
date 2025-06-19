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
        <div className="text-center py-12">
          <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some beautiful orchids to get started</p>
          <button
            onClick={() => window.location.href = '/products'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.variant && (
                    <p className="text-sm text-gray-600">
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` • Color: ${item.variant.color}`}
                      {item.variant.type && ` • Type: ${item.variant.type}`}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-bold text-purple-600">${item.price}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">${item.originalPrice}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const ShippingStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Select Shipping Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAddresses.map((address) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selectedAddress?.id === address.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedAddress(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {address.firstName} {address.lastName}
                  </span>
                  {address.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  {address.street}
                  {address.apartment && `, ${address.apartment}`}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <PhoneIcon className="w-3 h-3 mr-1" />
                    {address.phone}
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-3 h-3 mr-1" />
                    {address.email}
                  </div>
                </div>
              </div>
              
              {selectedAddress?.id === address.id && (
                <CheckCircleIcon className="w-5 h-5 text-purple-500" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors duration-200">
        + Add New Address
      </button>
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPaymentMethods.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selectedPayment?.id === payment.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPayment(payment)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getBrandIcon(payment.brand)}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    •••• •••• •••• {payment.last4}
                  </p>
                  <p className="text-sm text-gray-600">
                    {payment.holderName} • {payment.expiryMonth}/{payment.expiryYear}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {payment.brand} {payment.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {payment.isDefault && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
                {selectedPayment?.id === payment.id && (
                  <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors duration-200">
        + Add New Payment Method
      </button>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Order Review</h3>
      
      {/* Order Items */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Items ({items.length})</h4>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      {selectedAddress && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{selectedAddress.firstName} {selectedAddress.lastName}</p>
            <p>{selectedAddress.street}{selectedAddress.apartment && `, ${selectedAddress.apartment}`}</p>
            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
            <p>{selectedAddress.country}</p>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {selectedPayment && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getBrandIcon(selectedPayment.brand)}</span>
            <div className="text-sm">
              <p className="font-medium text-gray-900">•••• •••• •••• {selectedPayment.last4}</p>
              <p className="text-gray-600">{selectedPayment.holderName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Special instructions for your order..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
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
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="font-mono text-lg font-bold text-gray-900">ORD-{Date.now()}</p>
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
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Object.entries(stepTitles).map(([step, title], index) => {
              const isActive = step === checkoutStep;
              const isCompleted = ['cart', 'shipping', 'payment', 'review'].indexOf(step) < ['cart', 'shipping', 'payment', 'review'].indexOf(checkoutStep);
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isActive 
                      ? 'bg-purple-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {title}
                  </span>
                  {index < Object.keys(stepTitles).length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                  <button
                    onClick={handlePrevStep}
                    disabled={checkoutStep === 'cart'}
                    className="flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </button>

                  <button
                    onClick={handleNextStep}
                    disabled={isLoading || (checkoutStep === 'cart' && items.length === 0)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          {checkoutStep !== 'success' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
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
                      <span className="text-lg font-bold text-purple-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <TruckIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Secure checkout with 256-bit SSL encryption
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 