'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  GlobeAltIcon,
  ClockIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  SwatchIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'COLOR' | 'SIZE' | 'SELECT' | 'MULTISELECT';
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVisible: boolean;
  defaultValue?: string;
  options?: string[];
  validationRules?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

function AttributesContent() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'TEXT' as Attribute['type'],
    description: '',
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: false,
    isVisible: true,
    defaultValue: '',
    options: [] as string[],
    validationRules: '',
    sortOrder: 0
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/attributes');
      const attrs = Array.isArray(res.data?.data) ? res.data.data : [];
      setAttributes(attrs);
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      toast.error('Failed to fetch attributes');
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAttribute) {
        // Update
        await axios.put(`/api/attributes/${editingAttribute.id}`, formData);
        toast.success('Attribute updated successfully!');
      } else {
        // Create
        await axios.post('/api/attributes', formData);
        toast.success('Attribute created successfully!');
      }
      setShowAddModal(false);
      setEditingAttribute(null);
      resetForm();
      await fetchAttributes();
    } catch (error) {
      console.error('Failed to save attribute:', error);
      toast.error('Failed to save attribute');
    }
  };

  const handleDelete = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;
    try {
      await axios.delete(`/api/attributes/${attributeId}`);
      toast.success('Attribute deleted successfully!');
      await fetchAttributes();
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      toast.error('Failed to delete attribute');
    }
  };

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      code: attribute.code,
      type: attribute.type,
      description: attribute.description || '',
      isRequired: attribute.isRequired,
      isFilterable: attribute.isFilterable,
      isSearchable: attribute.isSearchable,
      isComparable: attribute.isComparable,
      isVisible: attribute.isVisible,
      defaultValue: attribute.defaultValue || '',
      options: attribute.options || [],
      validationRules: attribute.validationRules || '',
      sortOrder: attribute.sortOrder
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'TEXT',
      description: '',
      isRequired: false,
      isFilterable: false,
      isSearchable: false,
      isComparable: false,
      isVisible: true,
      defaultValue: '',
      options: [],
      validationRules: '',
      sortOrder: 0
    });
  };

  const openAddModal = () => {
    setEditingAttribute(null);
    resetForm();
    setShowAddModal(true);
  };

  const getTypeIcon = (type: Attribute['type']) => {
    switch (type) {
      case 'TEXT': return <TagIcon className="w-4 h-4" />;
      case 'NUMBER': return <CubeIcon className="w-4 h-4" />;
      case 'BOOLEAN': return <CheckIcon className="w-4 h-4" />;
      case 'COLOR': return <SwatchIcon className="w-4 h-4" />;
      case 'SIZE': return <ArchiveBoxIcon className="w-4 h-4" />;
      case 'SELECT': return <GlobeAltIcon className="w-4 h-4" />;
      case 'MULTISELECT': return <ShoppingBagIcon className="w-4 h-4" />;
      default: return <TagIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Attribute['type']) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NUMBER': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOOLEAN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COLOR': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SIZE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SELECT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'MULTISELECT': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAttributes = (Array.isArray(attributes) ? attributes : []).filter(attribute => {
    const matchesSearch = attribute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attribute.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || attribute.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attributes', href: '/admin/attributes' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative overflow-hidden">
          {/* Dazzling Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            {/* Subtle floating particles */}
            <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
            <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
                />
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dazzling Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          
          {/* Subtle floating particles */}
          <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
          <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Attribute Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <CogIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Manage product attributes and their configurations
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAddModal}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                <span className="relative flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Attribute
                  <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Search Attributes
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or code..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="md:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Filter by Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Types</option>
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="COLOR">Color</option>
                      <option value="SIZE">Size</option>
                      <option value="SELECT">Select</option>
                      <option value="MULTISELECT">Multi-Select</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attributes Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAttributes.map((attribute, index) => (
              <motion.div
                key={attribute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {attribute.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {attribute.code}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(attribute)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(attribute.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <span className="text-gray-600 flex items-center">
                        {getTypeIcon(attribute.type)}
                        <span className="ml-2">Type:</span>
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(attribute.type)}`}>
                        {attribute.type}
                      </span>
                    </div>
                    
                    {attribute.description && (
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                        <p className="text-sm text-gray-600">{attribute.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <CheckIcon className={`w-4 h-4 mr-2 ${attribute.isRequired ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium">Required</span>
                      </div>
                      <div className="flex items-center p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <EyeIcon className={`w-4 h-4 mr-2 ${attribute.isVisible ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium">Visible</span>
                      </div>
                      <div className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        <TagIcon className={`w-4 h-4 mr-2 ${attribute.isFilterable ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium">Filterable</span>
                      </div>
                      <div className="flex items-center p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <StarIcon className={`w-4 h-4 mr-2 ${attribute.isComparable ? 'text-orange-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium">Comparable</span>
                      </div>
                    </div>
                    
                    {attribute.options && attribute.options.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-purple-500" />
                          Options ({attribute.options.length}):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {attribute.options.slice(0, 3).map((option, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-lg font-medium">
                              {option}
                            </span>
                          ))}
                          {attribute.options.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                              +{attribute.options.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredAttributes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CogIcon className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    No attributes found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || filterType !== 'all' 
                      ? 'No attributes match your current filters. Try adjusting your search criteria.'
                      : 'Create your first attribute to start managing product properties like size, color, material, and more.'
                    }
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddModal}
                    className="group/btn relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover/btn:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add First Attribute
                      <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add/Edit Modal */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="group relative w-full max-w-2xl"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingAttribute(null);
                          resetForm();
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Attribute Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Attribute Code *
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Attribute Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as Attribute['type'] })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="TEXT">Text</option>
                          <option value="NUMBER">Number</option>
                          <option value="BOOLEAN">Boolean</option>
                          <option value="COLOR">Color</option>
                          <option value="SIZE">Size</option>
                          <option value="SELECT">Select (Single Choice)</option>
                          <option value="MULTISELECT">Multi-Select</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Describe what this attribute is used for..."
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <input
                            type="checkbox"
                            id="isRequired"
                            checked={formData.isRequired}
                            onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isRequired" className="ml-3 block text-sm font-bold text-gray-900">
                            Required
                          </label>
                        </div>

                        <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                          <input
                            type="checkbox"
                            id="isVisible"
                            checked={formData.isVisible}
                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isVisible" className="ml-3 block text-sm font-bold text-gray-900">
                            Visible
                          </label>
                        </div>

                        <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                          <input
                            type="checkbox"
                            id="isFilterable"
                            checked={formData.isFilterable}
                            onChange={(e) => setFormData({ ...formData, isFilterable: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isFilterable" className="ml-3 block text-sm font-bold text-gray-900">
                            Filterable
                          </label>
                        </div>

                        <div className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                          <input
                            type="checkbox"
                            id="isComparable"
                            checked={formData.isComparable}
                            onChange={(e) => setFormData({ ...formData, isComparable: e.target.checked })}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isComparable" className="ml-3 block text-sm font-bold text-gray-900">
                            Comparable
                          </label>
                        </div>
                      </div>

                      {(formData.type === 'SELECT' || formData.type === 'MULTISELECT' || formData.type === 'COLOR' || formData.type === 'SIZE') && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Options (one per line)
                          </label>
                          <textarea
                            value={formData.options.join('\n')}
                            onChange={(e) => setFormData({ ...formData, options: e.target.value.split('\n').filter(option => option.trim()) })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter options, one per line..."
                          />
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                          <span className="relative flex items-center justify-center">
                            {editingAttribute ? (
                              <>
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Update Attribute
                              </>
                            ) : (
                              <>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create Attribute
                                <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                              </>
                            )}
                          </span>
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowAddModal(false);
                            setEditingAttribute(null);
                            resetForm();
                          }}
                          className="flex-1 group relative overflow-hidden bg-white text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                          <span className="relative">Cancel</span>
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AttributesPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
            />
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    }>
      <AttributesContent />
    </Suspense>
  );
} 