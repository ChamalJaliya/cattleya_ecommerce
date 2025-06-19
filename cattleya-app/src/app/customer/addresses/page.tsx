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
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
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
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Shipping Address</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="billing"
                checked={formData.type === 'billing'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Billing Address</span>
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
            placeholder="e.g., Home, Office, etc."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, Suite, etc. (Optional)</label>
          <input
            type="text"
            value={formData.apartment}
            onChange={(e) => handleInputChange('apartment', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Set as default {formData.type} address
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
            {editingId ? 'Update Address' : 'Save Address'}
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-3">
            {address.label === 'Office' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
            ) : (
              <HomeIcon className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{address.label}</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                address.type === 'shipping' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
              </span>
              {address.isDefault && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(address)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(address.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors duration-200"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p>
        {address.company && <p>{address.company}</p>}
        <p>{address.street}</p>
        {address.apartment && <p>{address.apartment}</p>}
        <p>{address.city}, {address.state} {address.zipCode}</p>
        <p>{address.country}</p>
        <p>{address.phone}</p>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => handleSetDefault(address.id, address.type)}
          className="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
        >
          Set as Default
        </button>
      )}
    </motion.div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600 mt-2">Manage your shipping and billing addresses</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Address
            </button>
          </div>
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && <AddressForm />}

        {/* Address Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Addresses</p>
                <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shipping Addresses</p>
                <p className="text-2xl font-bold text-gray-900">{shippingAddresses.length}</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Billing Addresses</p>
                <p className="text-2xl font-bold text-gray-900">{billingAddresses.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Shipping Addresses */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shippingAddresses.map((address, index) => (
              <AddressCard key={address.id} address={address} index={index} />
            ))}
            {shippingAddresses.length === 0 && (
              <div className="col-span-full text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No shipping addresses found</p>
              </div>
            )}
          </div>
        </div>

        {/* Billing Addresses */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billingAddresses.map((address, index) => (
              <AddressCard key={address.id} address={address} index={index} />
            ))}
            {billingAddresses.length === 0 && (
              <div className="col-span-full text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No billing addresses found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
} 