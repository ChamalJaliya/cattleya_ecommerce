'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, PencilIcon, TrashIcon, EyeIcon, CogIcon, SparklesIcon,
  TagIcon, CubeIcon, CheckIcon, SwatchIcon, ArchiveBoxIcon, GlobeAltIcon,
  ShoppingBagIcon, StarIcon, RectangleStackIcon, FolderIcon, Squares2X2Icon
} from '@heroicons/react/24/outline';
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
  options?: string[];
  sortOrder: number;
}

interface AttributeSet {
  id: string;
  name: string;
  code: string;
  description?: string;
  attributes: Attribute[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AttributeSetsPage() {
  const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSet, setEditingSet] = useState<AttributeSet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    attributeIds: [] as string[],
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real attributes and attribute sets from backend
      const [attrRes, setRes] = await Promise.all([
        axios.get('/api/attributes'),
        axios.get('/api/attribute-sets'),
      ]);
      const attrs = Array.isArray(attrRes.data?.data) ? attrRes.data.data : [];
      const sets = Array.isArray(setRes.data?.data) ? setRes.data.data : [];
      setAttributes(attrs);
      setAttributeSets(sets);
    } catch (error) {
      toast.error('Failed to fetch data');
      setAttributes([]);
      setAttributeSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedAttributes = attributes.filter(attr => formData.attributeIds.includes(attr.id));
      
      if (editingSet) {
        const updatedSets = attributeSets.map(set => 
          set.id === editingSet.id ? { ...set, ...formData, attributes: selectedAttributes } : set
        );
        setAttributeSets(updatedSets);
        toast.success('Attribute set updated successfully!');
      } else {
        const newSet: AttributeSet = {
          id: Date.now().toString(),
          ...formData,
          attributes: selectedAttributes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAttributeSets([...attributeSets, newSet]);
        toast.success('Attribute set created successfully!');
      }
      
      setShowAddModal(false);
      setEditingSet(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save attribute set');
    }
  };

  const handleDelete = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this attribute set?')) return;
    
    try {
      setAttributeSets(attributeSets.filter(set => set.id !== setId));
      toast.success('Attribute set deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete attribute set');
    }
  };

  const handleEdit = (set: AttributeSet) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      code: set.code,
      description: set.description || '',
      attributeIds: set.attributes.map(attr => attr.id),
      isActive: set.isActive,
      sortOrder: set.sortOrder
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      attributeIds: [],
      isActive: true,
      sortOrder: 0
    });
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

  const filteredSets = attributeSets.filter(set => 
    set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attribute Sets', href: '/admin/attribute-sets' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
            <div className="flex items-center justify-center min-h-[60vh]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <AdminBreadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Attribute Sets
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <RectangleStackIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Group and organize product attributes into reusable sets
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              >
                <span className="relative flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Attribute Set
                  <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                </span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <div className="group relative">
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Search Attribute Sets</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or code..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {set.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">{set.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(set)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(set.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {set.description && (
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                        <p className="text-sm text-gray-600">{set.description}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <span className="text-gray-600 flex items-center">
                        <Squares2X2Icon className="w-4 h-4 mr-2" />
                        Attributes:
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                        {set.attributes.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <span className="text-gray-600 flex items-center">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Status:
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        set.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {set.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <RectangleStackIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Attributes in this set:
                      </h4>
                      <div className="space-y-2">
                        {set.attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <div className="flex items-center">
                              {getTypeIcon(attr.type)}
                              <span className="ml-2 text-sm font-medium text-gray-700">{attr.name}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getTypeColor(attr.type)}`}>
                              {attr.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredSets.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RectangleStackIcon className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  No attribute sets found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Create your first attribute set to group related attributes together for easier product management.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddModal(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                >
                  <span className="relative flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add First Attribute Set
                    <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

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
                  className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {editingSet ? 'Edit Attribute Set' : 'Add New Attribute Set'}
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingSet(null);
                        resetForm();
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Set Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Set Code *</label>
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Describe what this attribute set is used for..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Attributes *</label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                            <input
                              type="checkbox"
                              id={attr.id}
                              checked={formData.attributeIds.includes(attr.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, attributeIds: [...formData.attributeIds, attr.id] });
                                } else {
                                  setFormData({ ...formData, attributeIds: formData.attributeIds.filter(id => id !== attr.id) });
                                }
                              }}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor={attr.id} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-gray-900">{attr.name}</span>
                                  <span className="text-sm text-gray-500 ml-2 font-mono">({attr.code})</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getTypeColor(attr.type)}`}>
                                  {attr.type}
                                </span>
                              </div>
                              {attr.description && (
                                <p className="text-sm text-gray-600 mt-1">{attr.description}</p>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-3 block text-sm font-bold text-gray-900">
                        Active
                      </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                      >
                        {editingSet ? 'Update Attribute Set' : 'Create Attribute Set'}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingSet(null);
                          resetForm();
                        }}
                        className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg border border-gray-200"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
} 