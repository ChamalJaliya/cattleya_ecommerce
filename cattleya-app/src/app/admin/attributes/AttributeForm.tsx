'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CogIcon,
  CommandLineIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CubeIcon,
  GlobeAltIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { toast } from 'react-hot-toast';

interface AttributeFormProps {
  mode: 'add' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AttributeForm: React.FC<AttributeFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'TEXT' as 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'COLOR' | 'SIZE' | 'SELECT' | 'MULTISELECT',
    description: '',
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: false,
    isVisible: true,
    isVariantDefining: false,
    isVariantOverridable: false,
    defaultValue: '',
    options: [] as Array<{ value: string; label: string; isDefault: boolean }>,
    validationRules: '',
    sortOrder: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        type: initialData.type || 'TEXT',
        description: initialData.description || '',
        isRequired: initialData.isRequired || false,
        isFilterable: initialData.isFilterable || false,
        isSearchable: initialData.isSearchable || false,
        isComparable: initialData.isComparable || false,
        isVisible: initialData.isVisible !== undefined ? initialData.isVisible : true,
        isVariantDefining: initialData.isVariantDefining || false,
        isVariantOverridable: initialData.isVariantOverridable || false,
        defaultValue: initialData.defaultValue || '',
        options: initialData.options || [],
        validationRules: initialData.validationRules || '',
        sortOrder: initialData.sortOrder || 0
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success(`Attribute ${mode === 'add' ? 'created' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Failed to save attribute:', error);
      toast.error('Failed to save attribute');
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { value: '', label: '', isDefault: false }]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: 'label' | 'value' | 'isDefault', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const setDefaultOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => ({ ...opt, isDefault: i === index }))
    }));
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attributes', href: '/admin/attributes' },
    { label: mode === 'add' ? 'Add Attribute' : 'Edit Attribute', href: '#' }
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
          {/* Enhanced Header */}
          <div className="mb-8">
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                  {mode === 'add' ? 'Add New Attribute' : 'Edit Attribute'}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <CogIcon className="w-5 h-5 mr-2 text-purple-500" />
                  {mode === 'add' ? 'Create a new product attribute' : 'Update attribute configuration'}
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

          {/* Enhanced Form Container */}
          <div className="group relative w-full perspective-1000">
            {/* Enhanced Glow Effects */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-violet-600/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
            
            {/* Floating Particles */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400/60 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400/50 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Enhanced Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="group/field relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CommandLineIcon className="w-4 h-4 mr-2 text-blue-500" />
                        Attribute Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        required
                        placeholder="Enter attribute name..."
                      />
                    </div>
                  </div>

                  <div className="group/field relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CpuChipIcon className="w-4 h-4 mr-2 text-green-500" />
                        Attribute Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 font-mono"
                        required
                        placeholder="attribute_code"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="group/field relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <PuzzlePieceIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Attribute Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        required
                      >
                        <option value="TEXT">📝 Text</option>
                        <option value="NUMBER">🔢 Number</option>
                        <option value="BOOLEAN">✅ Boolean</option>
                        <option value="COLOR">🎨 Color</option>
                        <option value="SIZE">📏 Size</option>
                        <option value="SELECT">🔽 Select (Single Choice)</option>
                        <option value="MULTISELECT">📋 Multi-Select</option>
                      </select>
                    </div>
                  </div>

                  <div className="group/field relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <LightBulbIcon className="w-4 h-4 mr-2 text-orange-500" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 resize-none"
                        placeholder="Describe what this attribute is used for..."
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Checkbox Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[
                    { key: 'isRequired', label: 'Required', icon: ShieldCheckIcon, color: 'green', bg: 'from-green-50 to-emerald-50' },
                    { key: 'isVisible', label: 'Visible', icon: EyeIcon, color: 'purple', bg: 'from-purple-50 to-pink-50' },
                    { key: 'isFilterable', label: 'Filterable', icon: FunnelIcon, color: 'blue', bg: 'from-blue-50 to-cyan-50' },
                    { key: 'isComparable', label: 'Comparable', icon: ChartBarIcon, color: 'orange', bg: 'from-orange-50 to-red-50' },
                    { key: 'isVariantDefining', label: 'Variant Defining', icon: CubeIcon, color: 'indigo', bg: 'from-indigo-50 to-violet-50' },
                    { key: 'isVariantOverridable', label: 'Variant Overridable', icon: GlobeAltIcon, color: 'teal', bg: 'from-teal-50 to-cyan-50' },
                    { key: 'isSearchable', label: 'Searchable', icon: MagnifyingGlassIcon, color: 'pink', bg: 'from-pink-50 to-rose-50' }
                  ].map((checkbox, index) => (
                    <div
                      key={checkbox.key}
                      className={`group/checkbox relative p-4 rounded-xl border-2 border-dashed transition-all duration-300 bg-gradient-to-br ${checkbox.bg} hover:border-solid hover:border-${checkbox.color}-300 hover:shadow-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r from-${checkbox.color}-500 to-${checkbox.color}-600 rounded-lg flex items-center justify-center shadow-lg`}>
                          <checkbox.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[checkbox.key as keyof typeof formData] as boolean}
                              onChange={(e) => setFormData({ ...formData, [checkbox.key]: e.target.checked })}
                              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="font-semibold text-gray-700">{checkbox.label}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Options Section */}
                {(formData.type === 'SELECT' || formData.type === 'MULTISELECT' || formData.type === 'COLOR' || formData.type === 'SIZE') && (
                  <div className="group/options relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover/options:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-8 border border-violet-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                            <ListBulletIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">Options Configuration</h3>
                            <p className="text-sm text-gray-600">Define the available options for this attribute</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-4 py-2 bg-violet-100 text-violet-800 text-sm font-semibold rounded-full">
                            {formData.options.length} options
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {formData.options.map((option, idx) => (
                          <div key={idx} className="group/option relative overflow-hidden rounded-xl transition-all duration-300 shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02]">
                            <div className="flex items-center gap-4 p-6">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={e => updateOption(idx, 'label', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                  placeholder="Option label"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={e => updateOption(idx, 'value', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm font-mono text-sm"
                                  placeholder="option_value"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setDefaultOption(idx)}
                                className={`p-3 rounded-lg transition-all duration-200 ${
                                  option.isDefault 
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 shadow-lg' 
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:from-yellow-100 hover:to-amber-100 hover:text-yellow-700'
                                }`}
                              >
                                <StarIcon className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeOption(idx)}
                                className="p-3 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 text-red-600 hover:from-red-200 hover:to-pink-200 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Delete option"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-6 w-full group/btn relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-violet-500/30"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover/btn:opacity-40 transition duration-300"></div>
                        <span className="relative flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Add Option
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Enhanced Form Actions */}
                <div className="flex gap-6 pt-8">
                  <button
                    type="submit"
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center justify-center">
                      {mode === 'add' ? (
                        <>
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Create Attribute
                          <SparklesIcon className="w-5 h-5 ml-2 animate-pulse" />
                        </>
                      ) : (
                        <>
                          <CogIcon className="w-5 h-5 mr-2" />
                          Update Attribute
                        </>
                      )}
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

export default AttributeForm; 