'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { usersApi } from '@/core/infrastructure/api/users.api';
import { User } from '@/core/domain/entities/User';

interface ApiUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  createdAt?: string;
  updatedAt?: string;
  isBlocked?: boolean;
  blockReason?: string;
  profile?: {
    phone?: string;
    avatar?: string;
  };
}

interface EditCustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditCustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER'
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUserById(userId);
      
      console.log('API Response:', response); // Debug log
      
      // Handle nested response structure
      let userData: any;
      if (response.success && response.data) {
        // Check if data is nested (response.data.data) or direct (response.data)
        const responseData = response.data as any;
        userData = responseData.data || responseData;
      } else {
        throw new Error('Invalid response structure');
      }
      
      const apiUser: ApiUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        isBlocked: userData.isBlocked,
        blockReason: userData.blockReason,
        profile: userData.profile
      };
      
      setUser(apiUser);
      setFormData({
        firstName: apiUser.firstName || '',
        lastName: apiUser.lastName || '',
        email: apiUser.email || '',
        phone: apiUser.profile?.phone || '',
        role: apiUser.role || 'CUSTOMER'
      });
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditCustomerForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await usersApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });
      
      if (response.success) {
        setSuccessMessage('Customer updated successfully!');
        
        setTimeout(() => {
          setSuccessMessage(null);
          router.push('/admin/customers');
        }, 2000);
      } else {
        setError('Failed to update customer');
      }
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading customer details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !user) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Customer</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/customers')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Back to Customers
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">{successMessage}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </motion.div>
        )}

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin/customers')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Edit Customer
              </h1>
              <p className="text-gray-600 mt-1">Update customer information and settings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="text-center">
                <div className="mx-auto mb-4">
                  {user?.profile?.avatar ? (
                    <img 
                      className="h-20 w-20 rounded-full object-cover mx-auto" 
                      src={user.profile.avatar} 
                      alt="" 
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white font-bold text-xl">
                        {getInitials(user?.firstName, user?.lastName)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user?.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 mr-3" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 mr-3" />
                  <span>Status: {user?.isBlocked ? 'Blocked' : 'Active'}</span>
                </div>
                {user?.profile?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-3" />
                    <span>{user.profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/customers')}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
} 