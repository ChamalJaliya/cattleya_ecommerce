'use client';

import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  SparklesIcon,
  RectangleStackIcon,
  CpuChipIcon,
  LightBulbIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import axios from 'axios';

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
}

interface AttributeSetFormData {
  name: string;
  code: string;
  description: string;
  attributeIds: string[];
  isActive: boolean;
  sortOrder: number;
}

interface AttributeSetFormProps {
  mode: 'add' | 'edit';
  formData: AttributeSetFormData;
  allAttributes: Attribute[];
  onSubmit: (data: AttributeSetFormData) => void;
  onCancel: () => void;
}

const AttributeSetForm: React.FC<AttributeSetFormProps> = ({ mode, formData: initialFormData, allAttributes, onSubmit, onCancel }) => {
  console.log('allAttributes in form', allAttributes);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit(formData);
    setSubmitting(false);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attribute Sets', href: '/admin/attribute-sets' },
    { label: mode === 'add' ? 'Add Attribute Set' : 'Edit Attribute Set', href: '#' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dazzling Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          <div className="mb-8">
            <AdminBreadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                  {mode === 'add' ? 'Add New Attribute Set' : 'Edit Attribute Set'}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <RectangleStackIcon className="w-5 h-5 mr-2 text-purple-500" />
                  {mode === 'add' ? 'Create a new group of related product attributes' : 'Update attribute set configuration'}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="group/close relative p-3 text-gray-400 hover:text-gray-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-xl opacity-0 group-hover/close:opacity-100 transition-opacity duration-300"></div>
                <ArrowLeftIcon className="w-6 h-6 relative z-10" />
              </button>
            </div>
          </div>

          <div className="group relative w-full perspective-1000">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-violet-600/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="group/field relative">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <CpuChipIcon className="w-4 h-4 mr-2 text-green-500" />
                      Set Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      required
                      placeholder="Enter attribute set name..."
                    />
                  </div>
                  <div className="group/field relative">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <CpuChipIcon className="w-4 h-4 mr-2 text-green-500" />
                      Set Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 font-mono"
                      required
                      placeholder="attribute_set_code"
                    />
                  </div>
                </div>
                <div className="group/field relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <LightBulbIcon className="w-4 h-4 mr-2 text-orange-500" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 resize-none"
                    placeholder="Describe what this attribute set is used for..."
                  />
                </div>
                <div className="group/field relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    Active
                  </label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                </div>
                <div className="group/field relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
                    Select Attributes
                  </label>
                  <div className="space-y-4">
                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Search attributes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      onChange={(e) => {
                        // TODO: Implement search functionality
                        console.log('Search:', e.target.value);
                      }}
                    />
                    
                    {/* Selected Attributes Display */}
                    {formData.attributeIds.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.attributeIds.map(id => {
                          const found = allAttributes.find(attr => attr.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
                            >
                              {found ? `${found.name} (${found.code})` : 'Unknown Attribute'}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  attributeIds: prev.attributeIds.filter(attrId => attrId !== id)
                                }))}
                                className="ml-2 text-purple-600 hover:text-purple-800"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Attribute Selection */}
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-xl">
                      <select
                        multiple
                        value={formData.attributeIds}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            attributeIds: selectedOptions
                          }));
                        }}
                        className="w-full p-2 space-y-1"
                        size={8}
                      >
                        {allAttributes.map(attr => (
                          <option key={attr.id} value={attr.id} className="p-2 hover:bg-purple-50">
                            {attr.name} ({attr.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Hold Ctrl (or Cmd on Mac) to select multiple attributes. Currently showing all available attributes.
                  </p>
                </div>
                <div className="flex gap-6 pt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center justify-center">
                      {mode === 'add' ? <PlusIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                      {mode === 'add' ? 'Create Attribute Set' : 'Update Attribute Set'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 group relative overflow-hidden bg-white text-gray-700 py-4 px-8 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                    <span className="relative">Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttributeSetForm; 