'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  CalendarDaysIcon,
  HashtagIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  loading?: boolean;
}

export default function OrderViewModal({ isOpen, onClose, order, loading = false }: OrderViewModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                    Order Details - {order.number}
                  </Dialog.Title>
                </div>

                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                  </div>
                ) : (
                  <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                    {/* Order Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{order.number}</h2>
                          <p className="text-gray-600">Created on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                            <CreditCardIcon className="w-4 h-4 mr-1" />
                            <span className="capitalize">{order.paymentStatus}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-6"
                      >
                        <div className="flex items-center mb-4">
                          <UserIcon className="w-5 h-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-gray-900">{order.email}</p>
                          </div>
                          {order.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-gray-900">{order.phone}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Order Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-xl p-6"
                      >
                        <div className="flex items-center mb-4">
                          <CurrencyDollarIcon className="w-5 h-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">${order.subtotal?.toFixed(2)}</span>
                          </div>
                          {order.taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium">${order.taxAmount?.toFixed(2)}</span>
                            </div>
                          )}
                          {order.shippingFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="font-medium">${order.shippingFee?.toFixed(2)}</span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount:</span>
                              <span className="font-medium text-green-600">-${order.discount?.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3 flex justify-between">
                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-purple-600">${order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Order Items */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <ShoppingBagIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                      </div>
                      <div className="space-y-3">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center space-x-4">
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                {item.variantName && (
                                  <p className="text-sm text-gray-500">{item.variantName}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${item.price?.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-sm font-medium text-purple-600">${item.subtotal?.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Shipping & Billing Addresses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-50 rounded-xl p-6"
                      >
                        <div className="flex items-center mb-4">
                          <MapPinIcon className="w-5 h-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                        </div>
                        {order.shippingAddress ? (
                          <div className="space-y-2">
                            <p className="text-gray-900">
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            {order.shippingAddress.company && (
                              <p className="text-gray-600">{order.shippingAddress.company}</p>
                            )}
                            <p className="text-gray-600">{order.shippingAddress.street}</p>
                            {order.shippingAddress.apartment && (
                              <p className="text-gray-600">{order.shippingAddress.apartment}</p>
                            )}
                            <p className="text-gray-600">
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-gray-600">{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p className="text-gray-600">{order.shippingAddress.phone}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">No shipping address available</p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-50 rounded-xl p-6"
                      >
                        <div className="flex items-center mb-4">
                          <MapPinIcon className="w-5 h-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                        </div>
                        {order.billingAddress ? (
                          <div className="space-y-2">
                            <p className="text-gray-900">
                              {order.billingAddress.firstName} {order.billingAddress.lastName}
                            </p>
                            {order.billingAddress.company && (
                              <p className="text-gray-600">{order.billingAddress.company}</p>
                            )}
                            <p className="text-gray-600">{order.billingAddress.street}</p>
                            {order.billingAddress.apartment && (
                              <p className="text-gray-600">{order.billingAddress.apartment}</p>
                            )}
                            <p className="text-gray-600">
                              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                            </p>
                            <p className="text-gray-600">{order.billingAddress.country}</p>
                            {order.billingAddress.phone && (
                              <p className="text-gray-600">{order.billingAddress.phone}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">No billing address available</p>
                        )}
                      </motion.div>
                    </div>

                    {/* Order Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <CalendarDaysIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order Placed</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        {order.paidAt && (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Payment Received</p>
                              <p className="text-xs text-gray-500">{formatDate(order.paidAt)}</p>
                            </div>
                          </div>
                        )}
                        {order.shippedAt && (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                              <p className="text-xs text-gray-500">{formatDate(order.shippedAt)}</p>
                            </div>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                              <p className="text-xs text-gray-500">{formatDate(order.deliveredAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Additional Information */}
                    {(order.trackingNumber || order.notes || order.customerNotes) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 bg-gray-50 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                        <div className="space-y-4">
                          {order.trackingNumber && (
                            <div>
                              <div className="flex items-center mb-2">
                                <HashtagIcon className="w-4 h-4 text-purple-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Tracking Number</span>
                              </div>
                              <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{order.trackingNumber}</p>
                            </div>
                          )}
                          {order.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Admin Notes</p>
                              <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{order.notes}</p>
                            </div>
                          )}
                          {order.customerNotes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Customer Notes</p>
                              <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{order.customerNotes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 