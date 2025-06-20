'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  SparklesIcon,
  HeartIcon,
  GiftIcon,
  CreditCardIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useCartStore } from '@/core/application/stores/useCartStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    subtotal,
    toggleCart,
    removeItem,
    updateQuantity
  } = useCartStore();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      toast.success('🗑️ Item removed from cart', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    } else {
      updateQuantity(itemId, newQuantity);
      toast.success('✨ Quantity updated', {
        style: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
          color: 'white',
        },
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success('🗑️ Item removed from cart', {
      style: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
      },
    });
  };

  const itemsCount = items.length;
  const hasDiscount = subtotal > 100;
  const shippingCost = subtotal > 100 ? 0 : 15;
  const total = subtotal + shippingCost;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleCart}>
        {/* Enhanced Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-full flex-col bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20"
                  >
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600" />
                      
                      <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
                          >
                            <ShoppingBagIcon className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                              Shopping Cart
                            </h2>
                            <p className="text-sm text-gray-500">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'} selected
                            </p>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={toggleCart}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 transition-all duration-200"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-transparent to-purple-50/20">
                      {items.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center h-full text-center px-4"
                        >
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="relative mb-8"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-xl">
                              <ShoppingBagIcon className="w-12 h-12 text-purple-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                              <SparklesIcon className="w-4 h-4 text-white" />
                            </div>
                          </motion.div>
                          
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
                          <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
                            Discover our beautiful collection of premium orchids and start your botanical journey
                          </p>
                          
                          <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              href="/products"
                              onClick={toggleCart}
                              className="group bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
                            >
                              <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                              <span>Explore Collection</span>
                            </Link>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                transition={{ 
                                  layout: { duration: 0.3 },
                                  opacity: { duration: 0.2 },
                                  delay: index * 0.05 
                                }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {/* Item Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative flex items-center space-x-4 p-5">
                                  {/* Product Image */}
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                    className="relative overflow-hidden rounded-xl shadow-lg"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-20 h-20 object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-product.jpg';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  </motion.div>
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Product Name */}
                                    <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-purple-600 transition-colors duration-300">
                                      {item.name}
                                    </h4>
                                    
                                    {/* Price */}
                                    <div className="flex items-center mt-2 space-x-2">
                                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        ${item.price.toFixed(2)}
                                      </span>
                                      {item.originalPrice && item.originalPrice > item.price && (
                                        <span className="text-sm text-gray-500 line-through">
                                          ${item.originalPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center space-x-3 bg-gray-100/80 rounded-xl p-1">
                                        <motion.button
                                          whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-white shadow-sm transition-all duration-200"
                                        >
                                          <MinusIcon className="w-4 h-4" />
                                        </motion.button>
                                        
                                        <motion.span 
                                          key={item.quantity}
                                          initial={{ scale: 1.2 }}
                                          animate={{ scale: 1 }}
                                          className="w-8 text-center font-bold text-gray-900"
                                        >
                                          {item.quantity}
                                        </motion.span>
                                        
                                        <motion.button
                                          whileHover={{ scale: 1.1, backgroundColor: '#10b981' }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                          disabled={item.quantity >= item.maxQuantity}
                                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <PlusIcon className="w-4 h-4" />
                                        </motion.button>
                                      </div>
                                      
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                                      >
                                        <TrashIcon className="w-5 h-5" />
                                      </motion.button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Footer */}
                    {items.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative border-t border-gray-200/50 bg-white/95 backdrop-blur-sm"
                      >
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50" />
                        
                        <div className="relative px-6 py-6 space-y-6">
                          {/* Shipping Info */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`flex items-center justify-between p-4 rounded-xl ${
                              hasDiscount 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                                : 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                hasDiscount ? 'bg-green-500' : 'bg-orange-500'
                              }`}>
                                {hasDiscount ? (
                                  <GiftIcon className="w-5 h-5 text-white" />
                                ) : (
                                  <TruckIcon className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className={`font-semibold ${hasDiscount ? 'text-green-700' : 'text-orange-700'}`}>
                                  {hasDiscount ? '🎉 Free Shipping!' : 'Shipping'}
                                </p>
                                <p className={`text-sm ${hasDiscount ? 'text-green-600' : 'text-orange-600'}`}>
                                  {hasDiscount ? 'You saved $15!' : `$${(100 - subtotal).toFixed(2)} more for free shipping`}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold ${hasDiscount ? 'text-green-700' : 'text-orange-700'}`}>
                              {hasDiscount ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                            </span>
                          </motion.div>

                          {/* Price Breakdown */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-gray-600">
                              <span>Subtotal ({itemsCount} items)</span>
                              <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                              <span>Shipping</span>
                              <span className={`font-semibold ${hasDiscount ? 'text-green-600' : ''}`}>
                                {hasDiscount ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-gray-900">Total</span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ${total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-3">
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                href="/customer/cart"
                                onClick={toggleCart}
                                className="group w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <CreditCardIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                <span>Proceed to Checkout</span>
                              </Link>
                            </motion.div>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={toggleCart}
                              className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all duration-300"
                            >
                              Continue Shopping
                            </motion.button>
                          </div>
                          
                          {/* Trust Indicators */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2"
                          >
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span>Secure checkout</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <HeartIcon className="w-3 h-3" />
                              <span>30-day return</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TruckIcon className="w-3 h-3" />
                              <span>Fast delivery</span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}