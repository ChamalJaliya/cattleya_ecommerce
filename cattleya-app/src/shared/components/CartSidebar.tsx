'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
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
      toast.success('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success('Item removed from cart');
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Shopping Cart ({items.length})
                      </h2>
                      <button
                        onClick={toggleCart}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                          <p className="text-gray-500 mb-6">Add some beautiful orchids to get started</p>
                          <Link
                            href="/products"
                            onClick={toggleCart}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                          >
                            Browse Products
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {items.map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-product.jpg';
                                  }}
                                />
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                  <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-purple-600">${item.price.toFixed(2)}</span>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                      <span className="text-sm text-gray-500 line-through ml-2">
                                        ${item.originalPrice.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                                      >
                                        <MinusIcon className="w-3 h-3" />
                                      </button>
                                      
                                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                                      
                                      <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.maxQuantity}
                                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <PlusIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold text-gray-900">Subtotal</span>
                          <span className="text-lg font-bold text-purple-600">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-3">
                          <Link
                            href="/customer/cart"
                            onClick={toggleCart}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center"
                          >
                            View Cart & Checkout
                          </Link>
                          
                          <button
                            onClick={toggleCart}
                            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
                          >
                            Continue Shopping
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-500 text-center mt-3">
                          Free shipping on orders over $100
                        </p>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 