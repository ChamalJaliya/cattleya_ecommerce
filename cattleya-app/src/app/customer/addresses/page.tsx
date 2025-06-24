'use client';

import { useState, useEffect } from 'react';
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
import { addressesApi, Address, CreateAddressDto, UpdateAddressDto } from '@/core/infrastructure/api/addressesApi';

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateAddressDto>({
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

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressesApi.getAddresses();
      setAddresses(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        // Update existing address
        const updateData: UpdateAddressDto = { ...formData };
        await addressesApi.updateAddress(editingId, updateData);
        setEditingId(null);
      } else {
        // Add new address
        await addressesApi.createAddress(formData);
        setShowAddForm(false);
      }
      
      // Reload addresses
      await loadAddresses();
      
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      type: address.type,
      isDefault: address.isDefault,
      label: address.label || '',
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || ''
    });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setError(null);
      await addressesApi.deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setError(null);
      await addressesApi.setDefaultAddress(id);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
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

  // Loading state
  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading addresses</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadAddresses}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

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
              <div className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.type === 'shipping'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <HomeIcon className={`w-5 h-5 ${
                    formData.type === 'shipping' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className={`font-semibold ${
                      formData.type === 'shipping' ? 'text-purple-900' : 'text-gray-700'
                    }`}>Shipping</div>
                    <div className={`text-sm ${
                      formData.type === 'shipping' ? 'text-purple-600' : 'text-gray-500'
                    }`}>For deliveries</div>
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
              <div className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.type === 'billing'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className={`w-5 h-5 ${
                    formData.type === 'billing' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className={`font-semibold ${
                      formData.type === 'billing' ? 'text-purple-900' : 'text-gray-700'
                    }`}>Billing</div>
                    <div className={`text-sm ${
                      formData.type === 'billing' ? 'text-purple-600' : 'text-gray-500'
                    }`}>For payments</div>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Default Address Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
            Set as default {formData.type} address
          </label>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label (Optional)</label>
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
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{editingId ? 'Update Address' : 'Add Address'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const AddressCard = ({ address, index }: { address: Address, index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 relative"
    >
      {/* Default Badge */}
      {address.isDefault && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <CheckIcon className="w-3 h-3" />
          Default
        </div>
      )}

      {/* Address Type Icon */}
      <div className="flex items-center space-x-3 mb-4">
        {address.type === 'shipping' ? (
          <HomeIcon className="w-6 h-6 text-purple-600" />
        ) : (
          <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
        )}
        <div>
          <h3 className="font-semibold text-gray-900 capitalize">{address.type} Address</h3>
          {address.label && (
            <p className="text-sm text-gray-500">{address.label}</p>
          )}
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 text-gray-700">
        <p className="font-medium">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-sm">{address.company}</p>
        )}
        <p>{address.street}</p>
        {address.apartment && (
          <p>{address.apartment}</p>
        )}
        <p>{address.city}, {address.state} {address.zipCode}</p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="text-sm text-gray-600">{address.phone}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
        {!address.isDefault && (
          <button
            onClick={() => handleSetDefault(address.id)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
            title="Set as default"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => handleEdit(address)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          title="Edit address"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(address.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Delete address"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  My Addresses
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