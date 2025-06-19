'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  TrashIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  TagIcon,
  GiftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    name: 'Cattleya Orchid Premium',
    description: 'Premium Cattleya orchid with vibrant purple blooms',
    price: 149.99,
    originalPrice: 179.99,
    image: '🌺',
    quantity: 1,
    inStock: true,
    stockCount: 25,
    onSale: true,
    discount: 17
  },
  {
    id: '2',
    name: 'Orchid Care Kit',
    description: 'Complete care kit with fertilizer, potting mix, and tools',
    price: 89.99,
    originalPrice: 89.99,
    image: '🧴',
    quantity: 1,
    inStock: true,
    stockCount: 45,
    onSale: false,
    discount: 0
  },
  {
    id: '3',
    name: 'Premium Potting Mix',
    description: 'Specially formulated potting mix for orchids',
    price: 24.99,
    originalPrice: 24.99,
    image: '🏺',
    quantity: 2,
    inStock: true,
    stockCount: 120,
    onSale: false,
    discount: 0
  }
];

const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping', price: 9.99, time: '5-7 business days', selected: true },
  { id: 'express', name: 'Express Shipping', price: 19.99, time: '2-3 business days', selected: false },
  { id: 'overnight', name: 'Overnight Shipping', price: 39.99, time: 'Next business day', selected: false }
];

export default function CustomerCartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [shipping, setShipping] = useState(shippingOptions);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const moveToWishlist = (id: string) => {
    // In a real app, this would add to wishlist and remove from cart
    console.log('Moving to wishlist:', id);
    removeItem(id);
  };

  const updateShipping = (selectedId: string) => {
    setShipping(options =>
      options.map(option => ({
        ...option,
        selected: option.id === selectedId
      }))
    );
  };

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === 'orchid10') {
      setPromoApplied(true);
      setPromoDiscount(10); // 10% discount
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const selectedShipping = shipping.find(option => option.selected);
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const promoDiscountAmount = (subtotal * promoDiscount) / 100;
  const tax = (subtotal - promoDiscountAmount) * 0.085; // 8.5% tax
  const total = subtotal - promoDiscountAmount + shippingCost + tax;

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Review your items and proceed to checkout</p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some beautiful orchids to get started!</p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {item.image}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-lg font-bold text-gray-900">${item.price}</span>
                            {item.onSale && (
                              <>
                                <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                  -{item.discount}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Stock Status */}
                          <p className="text-sm text-green-600 mt-1">
                            {item.stockCount > 10 ? 'In Stock' : `Only ${item.stockCount} left`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors duration-200"
                          >
                            <HeartIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.onSale && (
                            <p className="text-sm text-green-600">
                              You save ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Shipping Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Shipping Options
                </h3>
                <div className="space-y-3">
                  {shipping.map((option) => (
                    <label key={option.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        checked={option.selected}
                        onChange={() => updateShipping(option.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{option.name}</p>
                          <p className="text-sm text-gray-600">{option.time}</p>
                        </div>
                        <span className="font-medium text-gray-900">${option.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <GiftIcon className="w-4 h-4 mr-1" />
                      Promo code applied! {promoDiscount}% off
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Sale Savings</span>
                      <span>-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {promoApplied && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Promo Discount ({promoDiscount}%)</span>
                      <span>-${promoDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shippingCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Secure 256-bit SSL encryption</span>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>

                {/* Continue Shopping */}
                <button className="w-full mt-3 py-3 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                  Continue Shopping
                </button>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Free shipping on orders over $100
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    30-day money-back guarantee
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GiftIcon className="w-4 h-4 mr-2" />
                    Care instructions included
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
} 