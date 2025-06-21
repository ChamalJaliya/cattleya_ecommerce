'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock addresses data
const mockAddresses = [
  {
    id: '1',
    type: 'shipping',
    isDefault: true,
    label: 'Home',
    firstName: 'John',
    lastName: 'Smith',
    company: '',
    street: '123 Garden Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    type: 'billing',
    isDefault: true,
    label: 'Home',
    firstName: 'John',
    lastName: 'Smith',
    company: '',
    street: '123 Garden Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '3',
    type: 'shipping',
    isDefault: false,
    label: 'Office',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Tech Solutions Inc.',
    street: '456 Business Ave',
    apartment: 'Suite 200',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
    country: 'United States',
    phone: '+1 (555) 987-6543'
  }
];

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'shipping',
    isDefault: false,
    label: '',
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (editingId) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId ? { ...formData, id: editingId } : addr
      ));
      setEditingId(null);
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      setAddresses(prev => [...prev, newAddress]);
      setShowAddForm(false);
    }
    
    // Reset form
    setFormData({
      type: 'shipping',
      isDefault: false,
      label: '',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: ''
    });
  };

  const handleEdit = (address: typeof mockAddresses[0]) => {
    setFormData(address);
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string, type: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id && addr.type === type ? true : addr.type === type ? false : addr.isDefault
    })));
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      type: 'shipping',
      isDefault: false,
      label: '',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: ''
    });
  };

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.type === 'billing');

  const AddressForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl shadow-purple-500/5 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {editingId ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Address Type</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="shipping"
                checked={formData.type === 'shipping'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="sr-only"
              />
              <div className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.type === 'shipping'
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                  : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <HomeIcon className={`w-5 h-5 ${formData.type === 'shipping' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-medium ${formData.type === 'shipping' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-500">For deliveries</p>
                  </div>
                </div>
              </div>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="billing"
                checked={formData.type === 'billing'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="sr-only"
              />
              <div className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.type === 'billing'
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                  : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className={`w-5 h-5 ${formData.type === 'billing' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-medium ${formData.type === 'billing' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Billing Address
                    </p>
                    <p className="text-sm text-gray-500">For payments</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Address Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            placeholder="e.g., Home, Office, Vacation"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Company name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="Street address"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Apartment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, suite, etc. (Optional)</label>
          <input
            type="text"
            value={formData.apartment}
            onChange={(e) => handleInputChange('apartment', e.target.value)}
            placeholder="Apartment, suite, unit, etc."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Default Address */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
            Set as default {formData.type} address
          </label>
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
            {editingId ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const AddressCard = ({ address, index }: { address: typeof mockAddresses[0], index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
            {address.type === 'shipping' ? (
              <HomeIcon className="w-5 h-5 text-purple-600" />
            ) : (
              <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{address.label}</h3>
            <p className="text-sm text-gray-600 capitalize">{address.type} Address</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {address.isDefault && (
            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
              Default
            </span>
          )}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEdit(address)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(address.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-gray-900">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-gray-600">{address.company}</p>
        )}
        <p className="text-gray-600">
          {address.street}
          {address.apartment && `, ${address.apartment}`}
        </p>
        <p className="text-gray-600">
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p className="text-gray-600">{address.country}</p>
        <p className="text-gray-600">{address.phone}</p>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => handleSetDefault(address.id, address.type)}
          className="w-full py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 rounded-xl hover:shadow-md transition-all duration-200"
        >
          Set as Default
        </button>
      )}
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
                  Address Management
                </h1>
                <p className="text-gray-600">Manage your shipping and billing addresses</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <MapPinIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">{addresses.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Address Button */}
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
                <span className="font-semibold">Add New Address</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* Address Form */}
        {showAddForm && <AddressForm />}

        {/* Addresses Grid */}
        <div className="space-y-8">
          {/* Shipping Addresses */}
          {shippingAddresses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HomeIcon className="w-5 h-5 text-purple-600" />
                <span>Shipping Addresses</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shippingAddresses.map((address, index) => (
                  <AddressCard key={address.id} address={address} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Billing Addresses */}
          {billingAddresses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                <span>Billing Addresses</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {billingAddresses.map((address, index) => (
                  <AddressCard key={address.id} address={address} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {addresses.length === 0 && !showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses yet</h3>
              <p className="text-gray-600 mb-6">Add your first address to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                Add Address
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 