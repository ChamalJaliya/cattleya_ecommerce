'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit',
    brand: 'visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2027',
    holderName: 'John Smith',
    isDefault: true,
    nickname: 'Personal Visa'
  },
  {
    id: '2',
    type: 'credit',
    brand: 'mastercard',
    last4: '5555',
    expiryMonth: '09',
    expiryYear: '2026',
    holderName: 'John Smith',
    isDefault: false,
    nickname: 'Business Card'
  },
  {
    id: '3',
    type: 'debit',
    brand: 'amex',
    last4: '1234',
    expiryMonth: '03',
    expiryYear: '2028',
    holderName: 'John Smith',
    isDefault: false,
    nickname: 'Travel Card'
  }
];

export default function CustomerPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    nickname: '',
    isDefault: false,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    if (editingId) {
      // Update existing payment method
      setPaymentMethods(prev => prev.map(pm => 
        pm.id === editingId ? { 
          ...pm, 
          holderName: formData.holderName,
          nickname: formData.nickname,
          isDefault: formData.isDefault
        } : pm
      ));
      setEditingId(null);
    } else {
      // Add new payment method
      const newPaymentMethod = {
        id: Date.now().toString(),
        type: 'credit' as const,
        brand: getBrandFromNumber(formData.cardNumber),
        last4: formData.cardNumber.slice(-4),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        holderName: formData.holderName,
        isDefault: formData.isDefault,
        nickname: formData.nickname
      };
      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      setShowAddForm(false);
    }
    
    // Reset form
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      nickname: '',
      isDefault: false,
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      }
    });
  };

  const handleEdit = (paymentMethod: typeof mockPaymentMethods[0]) => {
    setFormData({
      cardNumber: '',
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      cvv: '',
      holderName: paymentMethod.holderName,
      nickname: paymentMethod.nickname,
      isDefault: paymentMethod.isDefault,
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      }
    });
    setEditingId(paymentMethod.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      nickname: '',
      isDefault: false,
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      }
    });
  };

  const getBrandFromNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'visa';
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa': return 'from-blue-600 via-blue-500 to-indigo-600';
      case 'mastercard': return 'from-red-600 via-orange-500 to-red-500';
      case 'amex': return 'from-emerald-600 via-teal-500 to-blue-600';
      default: return 'from-gray-600 via-gray-500 to-gray-700';
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const PaymentMethodForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl shadow-purple-500/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
          <div className="relative">
            <input
              type={showCardNumber ? 'text' : 'password'}
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showCardNumber ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month</label>
            <select
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year</label>
            <select
              value={formData.expiryYear}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
            <input
              type="password"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) => handleInputChange('holderName', e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Nickname (Optional)</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            placeholder="e.g., Personal Visa, Business Card"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Default Payment Method */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
            Set as default payment method
          </label>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              Your payment information is encrypted and secure
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            {editingId ? 'Update Payment Method' : 'Add Payment Method'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const PaymentMethodCard = ({ method, index }: { method: typeof mockPaymentMethods[0], index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group"
    >
      <div className={`bg-gradient-to-br ${getBrandColor(method.brand)} p-6 text-white relative h-56 transform group-hover:scale-105 transition-transform duration-300`}>
        {/* Holographic Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Card Content */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full uppercase tracking-wider">
                {method.type}
              </span>
              <h3 className="font-bold text-lg mt-2">{method.nickname || `${method.brand} Card`}</h3>
            </div>
            <span className="text-3xl font-bold uppercase tracking-wider">{method.brand}</span>
          </div>

          <div className="flex-grow flex items-center">
            <div className="font-mono text-2xl tracking-widest font-bold">
              •••• •••• •••• {method.last4}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-75 uppercase tracking-wider">Card Holder</p>
              <p className="font-semibold text-lg">{method.holderName}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 uppercase tracking-wider">Expires</p>
              <p className="font-semibold text-lg">{method.expiryMonth}/{method.expiryYear}</p>
            </div>
          </div>
        </div>
        
        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleEdit(method)}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(method.id)}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            {!method.isDefault && (
              <button
                onClick={() => handleSetDefault(method.id)}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-110 flex items-center space-x-2"
              >
                <StarIcon className="w-4 h-4" />
                <span>Set as Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Default Badge (always visible) */}
        {method.isDefault && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-white/25 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
              <StarIcon className="w-3 h-3 mr-1" />
              Default
            </span>
          </div>
        )}
      </div>
    </motion.div>
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
                  Payment Methods
                </h1>
                <p className="text-gray-600">Manage your payment methods securely</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <CreditCardIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">{paymentMethods.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Payment Method Button */}
        {!showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center space-x-2">
                <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-semibold">Add New Payment Method</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* Payment Method Form */}
        {showAddForm && <PaymentMethodForm />}

        {/* Payment Methods Grid */}
        <div className="space-y-6">
          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method, index) => (
                <PaymentMethodCard key={method.id} method={method} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods yet</h3>
              <p className="text-gray-600 mb-6">Add your first payment method to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                Add Payment Method
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 
} 