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
          ...prev[parent as keyof typeof prev],
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
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'from-blue-500 to-blue-600';
      case 'mastercard':
        return 'from-red-500 to-orange-500';
      case 'amex':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const PaymentMethodForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
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
        {!editingId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <div className="relative">
              <input
                type={showCardNumber ? 'text' : 'password'}
                value={formatCardNumber(formData.cardNumber)}
                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCardNumber ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Expiry and CVV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month</label>
            <select
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year</label>
            <select
              value={formData.expiryYear}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={String(new Date().getFullYear() + i)}>
                  {new Date().getFullYear() + i}
                </option>
              ))}
            </select>
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="password"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) => handleInputChange('holderName', e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Nickname (Optional)</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            placeholder="e.g., Personal Card, Business Card"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Default Card Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Set as default payment method
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            {editingId ? 'Update Card' : 'Add Card'}
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Card Visual */}
      <div className={`bg-gradient-to-r ${getBrandColor(method.brand)} p-6 text-white relative`}>
        <div className="flex items-center justify-between mb-8">
          <span className="text-2xl">{getBrandIcon(method.brand)}</span>
          <span className="text-sm font-medium uppercase">{method.brand}</span>
        </div>
        
        <div className="space-y-4">
          <div className="font-mono text-lg tracking-wider">
            •••• •••• •••• {method.last4}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-75">Card Holder</p>
              <p className="font-medium">{method.holderName}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Expires</p>
              <p className="font-medium">{method.expiryMonth}/{method.expiryYear}</p>
            </div>
          </div>
        </div>

        {method.isDefault && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full">
              <StarIcon className="w-3 h-3 mr-1" />
              Default
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{method.nickname || `${method.brand} Card`}</h3>
            <p className="text-sm text-gray-600 capitalize">{method.type} Card</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(method)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(method.id)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors duration-200"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!method.isDefault && (
          <button
            onClick={() => handleSetDefault(method.id)}
            className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
          >
            Set as Default
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600 mt-2">Manage your saved payment methods</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Card
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && <PaymentMethodForm />}

        {/* Payment Methods Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{paymentMethods.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Secure Storage</p>
                <p className="text-2xl font-bold text-gray-900">256-bit</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Default Card</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentMethods.find(pm => pm.isDefault)?.last4 || 'None'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <PaymentMethodCard key={method.id} method={method} index={index} />
          ))}
        </div>

        {paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No payment methods</h3>
            <p className="text-gray-500 mb-6">Add a payment method to make purchases easier</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Add Your First Card
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Payment Information is Secure</h3>
              <p className="text-blue-800 text-sm">
                We use industry-standard encryption to protect your payment information. Your card details are tokenized and never stored in plain text. We&apos;re PCI DSS compliant and follow strict security protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
} 