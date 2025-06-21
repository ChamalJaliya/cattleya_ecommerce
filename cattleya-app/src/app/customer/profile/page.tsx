'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

export default function CustomerProfilePage() {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    uploadAvatar, 
    isLoading 
  } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'United States'
    },
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      smsNotifications: user?.preferences?.smsNotifications ?? false,
      marketingEmails: user?.preferences?.marketingEmails ?? true,
      orderUpdates: user?.preferences?.orderUpdates ?? true,
      newsletter: user?.preferences?.newsletter ?? true,
      language: user?.preferences?.language || 'en',
      currency: user?.preferences?.currency || 'USD',
      timezone: user?.preferences?.timezone || 'America/New_York'
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: user?.twoFactorEnabled ?? false
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
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

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.security.newPassword !== formData.security.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    const success = await changePassword({
      currentPassword: formData.security.currentPassword,
      newPassword: formData.security.newPassword,
      confirmPassword: formData.security.confirmPassword
    });

    if (success) {
      setFormData(prev => ({
        ...prev,
        security: {
          ...prev.security,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative group">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 cursor-pointer group-hover:scale-110">
            <CameraIcon className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <p className="text-gray-600 text-sm">Upload a new avatar for your account</p>
          <button className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-200 font-semibold">
            Change Photo
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
          <div className="relative group">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'group-hover:border-purple-300'
              }`}
            />
            <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
          <div className="relative group">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'group-hover:border-purple-300'
              }`}
            />
            <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'group-hover:border-purple-300'
              }`}
            />
            <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <div className="relative group">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'group-hover:border-purple-300'
              }`}
            />
            <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
          <div className="relative group">
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'group-hover:border-purple-300'
              }`}
            />
            <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2 text-purple-500" />
          Address Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'hover:border-purple-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'hover:border-purple-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'hover:border-purple-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'hover:border-purple-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
            <select
              value={formData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                !isEditing ? 'bg-gray-50' : 'hover:border-purple-300'
              }`}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BellIcon className="w-5 h-5 mr-2 text-purple-500" />
          Notification Preferences
        </h4>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional content' },
            { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes' },
            { key: 'newsletter', label: 'Newsletter', description: 'Subscribe to our newsletter' }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div>
                <h5 className="font-semibold text-gray-900">{pref.label}</h5>
                <p className="text-sm text-gray-600">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences[pref.key as keyof typeof formData.preferences] as boolean}
                  onChange={(e) => handleInputChange(`preferences.${pref.key}`, e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account Preferences */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={formData.preferences.language}
              onChange={(e) => handleInputChange('preferences.language', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
            <select
              value={formData.preferences.currency}
              onChange={(e) => handleInputChange('preferences.currency', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
            <select
              value={formData.preferences.timezone}
              onChange={(e) => handleInputChange('preferences.timezone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <KeyIcon className="w-5 h-5 mr-2 text-purple-500" />
          Change Password
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.security.currentPassword}
                onChange={(e) => handleInputChange('security.currentPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 transition-all duration-200 group-hover:border-purple-300"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={formData.security.newPassword}
              onChange={(e) => handleInputChange('security.newPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.security.confirmPassword}
              onChange={(e) => handleInputChange('security.confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
              placeholder="Confirm new password"
            />
          </div>

          <button 
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 hover:shadow-lg"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-500" />
          Two-Factor Authentication
        </h4>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div>
            <h5 className="font-semibold text-gray-900">Enable 2FA</h5>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.security.twoFactorEnabled}
              onChange={(e) => handleInputChange('security.twoFactorEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
          </label>
        </div>
      </div>

      {/* Account Actions */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h4>
        <div className="space-y-3">
          <button className="w-full p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-900">Download Account Data</h5>
                <p className="text-sm text-gray-600">Get a copy of all your account information</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </button>

          <button className="w-full p-4 text-left border border-red-200 rounded-xl hover:bg-red-50 transition-all duration-200 text-red-600 group">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold">Delete Account</h5>
                <p className="text-sm">Permanently delete your account and all data</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
                Manage your account settings and preferences
              </p>
            </div>
            
            {activeTab === 'personal' && (
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 group"
                    >
                      <CheckIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 group"
                  >
                    <PencilIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 transition-all duration-200 ${
                          activeTab === tab.id ? 'text-white' : 'group-hover:text-purple-600'
                        }`} />
                        <span className="font-semibold">{tab.name}</span>
                        {activeTab === tab.id && (
                          <div className="ml-auto flex items-center space-x-1">
                            <StarIcon className="w-3 h-3 text-yellow-300 animate-pulse" />
                            <BoltIcon className="w-3 h-3 text-yellow-300" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                {activeTab === 'personal' && renderPersonalInfo()}
                {activeTab === 'preferences' && renderPreferences()}
                {activeTab === 'security' && renderSecurity()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}