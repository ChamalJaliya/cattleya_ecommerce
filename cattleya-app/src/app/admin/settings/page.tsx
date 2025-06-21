'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TruckIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  KeyIcon,
  PaintBrushIcon,
  CloudIcon,
  CheckIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Cattleya Orchids',
    siteDescription: 'Premium orchids and plant care supplies',
    contactEmail: 'admin@cattleya.com',
    supportEmail: 'support@cattleya.com',
    phone: '+1 (555) 123-4567',
    address: '123 Garden Street, Plant City, FL 33566',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    customerReviews: true,
    guestCheckout: true,
    autoBackup: true,
    maintenanceMode: false,
    shippingRates: {
      standard: 9.99,
      express: 19.99,
      overnight: 39.99
    },
    taxRate: 8.5,
    minOrderAmount: 25.00
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payment', name: 'Payment', icon: CurrencyDollarIcon },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'backup', name: 'Backup', icon: CloudIcon }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          value={settings.phone}
          onChange={(e) => handleSettingChange('phone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
        <textarea
          value={settings.address}
          onChange={(e) => handleSettingChange('address', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
        <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
          <div>
            <h3 className="font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
        <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
          <div>
            <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
        <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
          <div>
            <h3 className="font-semibold text-gray-900">Order Notifications</h3>
            <p className="text-sm text-gray-600">Get notified about new orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.orderNotifications}
              onChange={(e) => handleSettingChange('orderNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
        <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
          <div>
            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
            <p className="text-sm text-gray-600">Get notified when inventory is low</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Rates</h3>
        <div className="space-y-4">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div>
                <h4 className="font-semibold text-gray-900">Standard Shipping</h4>
                <p className="text-sm text-gray-600">5-7 business days</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  value={settings.shippingRates.standard}
                  onChange={(e) => handleNestedSettingChange('shippingRates', 'standard', parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div>
                <h4 className="font-semibold text-gray-900">Express Shipping</h4>
                <p className="text-sm text-gray-600">2-3 business days</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  value={settings.shippingRates.express}
                  onChange={(e) => handleNestedSettingChange('shippingRates', 'express', parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div>
                <h4 className="font-semibold text-gray-900">Overnight Shipping</h4>
                <p className="text-sm text-gray-600">Next business day</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  value={settings.shippingRates.overnight}
                  onChange={(e) => handleNestedSettingChange('shippingRates', 'overnight', parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
          <input
            type="number"
            value={settings.taxRate}
            onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Order Amount ($)</label>
          <input
            type="number"
            value={settings.minOrderAmount}
            onChange={(e) => handleSettingChange('minOrderAmount', parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'shipping':
        return renderShippingSettings();
      default:
        return (
          <div className="text-center py-12">
            <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Panel</h3>
            <p className="text-gray-500">Configure your {activeTab} settings here</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                  Settings
                </h1>
                <p className="text-gray-600 text-lg">Configure your store settings and preferences</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Save Changes
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab, index) => {
                      const Icon = tab.icon;
                      return (
                        <motion.button
                          key={tab.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {tab.name}
                        </motion.button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">
                      {activeTab} Settings
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Last saved: 2 minutes ago</span>
                    </div>
                  </div>

                  {renderTabContent()}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 