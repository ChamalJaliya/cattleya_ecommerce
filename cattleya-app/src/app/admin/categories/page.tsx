'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  FolderIcon,
  EyeIcon,
  Squares2X2Icon,
  TableCellsIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import CategoryTreeView from '@/shared/components/CategoryTreeView';
import CategoryForm from '@/shared/components/CategoryForm';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const mockCategories = [
  { id: '1', name: 'Orchids', description: 'Beautiful flowering orchids', productCount: 45, status: 'active', image: '🌺', createdAt: '2024-01-15' },
  { id: '2', name: 'Care Accessories', description: 'Tools and supplies for orchid care', productCount: 23, status: 'active', image: '🧴', createdAt: '2024-01-10' },
  { id: '3', name: 'Fertilizers', description: 'Nutrients for healthy growth', productCount: 12, status: 'active', image: '🌿', createdAt: '2024-01-08' },
  { id: '4', name: 'Potting Supplies', description: 'Pots, soil, and planting materials', productCount: 18, status: 'active', image: '🏺', createdAt: '2024-01-05' },
  { id: '5', name: 'Decorative Pots', description: 'Stylish pots to showcase your orchids.', productCount: 32, status: 'draft', image: '🌸', createdAt: '2024-02-01' },
];

const statusOptions = ['All Status', 'active', 'draft'];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mockCategoriesData, setMockCategoriesData] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'tree'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tree view state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories?includeTree=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch categories');
        // Fallback to mock data for now
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      // Fallback to mock data for now
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    router.push('/admin/categories/add');
  };

  const handleEditCategory = (category: Category) => {
    // Navigate to category detail page or show in modal
    console.log('View category:', category);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchCategories(); // Refresh the list
        } else {
          const errorData = await response.json();
          alert(`Failed to delete category: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleViewCategory = (category: Category) => {
    // Navigate to category detail page or show in modal
    console.log('View category:', category);
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDeleteMockCategory = (id: string) => {
    setMockCategoriesData(mockCategoriesData.filter(c => c.id !== id));
  };

  const filteredCategories = mockCategoriesData.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || category.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Categories', href: '/admin/categories' }
  ];

  const stats = {
    total: categories.length || mockCategoriesData.length,
    active: (categories.filter(c => c.isActive).length) || (mockCategoriesData.filter(c => c.status === 'active').length),
    draft: (categories.filter(c => !c.isActive).length) || (mockCategoriesData.filter(c => c.status === 'draft').length),
    totalProducts: (categories.reduce((sum, cat) => sum + cat.productCount, 0)) || (mockCategoriesData.reduce((sum, cat) => sum + cat.productCount, 0)),
  };

  const statsData = [
    {
      name: 'Total Categories',
      value: stats.total.toString(),
      change: '+2',
      changeType: 'increase' as const,
      icon: FolderIcon,
      color: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Categories created'
    },
    {
      name: 'Active Categories',
      value: stats.active.toString(),
      change: '+1',
      changeType: 'increase' as const,
      icon: CheckIcon,
      color: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Visible to customers'
    },
    {
      name: 'Total Products',
      value: stats.totalProducts.toString(),
      change: '+125',
      changeType: 'increase' as const,
      icon: TagIcon,
      color: 'from-yellow-500 via-orange-500 to-red-500',
      iconBg: 'from-yellow-400 to-orange-600',
      glowColor: 'shadow-yellow-500/30',
      description: 'Across all categories'
    },
    {
      name: 'Draft Categories',
      value: stats.draft.toString(),
      change: '-1',
      changeType: 'decrease' as const,
      icon: PencilIcon,
      color: 'from-gray-500 via-gray-500 to-gray-600',
      iconBg: 'from-gray-400 to-gray-600',
      glowColor: 'shadow-gray-500/30',
      description: 'Not yet published'
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                  Category Management
                </h1>
                <p className="text-gray-600 text-lg">Organize and manage your product categories.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Category Dashboard Overview
                  </span>
                </div>
                <button 
                  onClick={handleAddCategory}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Add Category
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                        <div className="ml-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        {stat.change && (
                          <div className="flex items-center">
                            {stat.changeType === 'increase' ? (
                              <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                                <ArrowUpIcon className="w-3 h-3 text-green-600 mr-1" />
                                <span className="text-xs font-bold text-green-700">{stat.change}</span>
                              </div>
                            ) : stat.changeType === 'decrease' ? (
                              <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
                                <ArrowUpIcon className="w-3 h-3 text-red-600 mr-1 rotate-180" />
                                <span className="text-xs font-bold text-red-700">{stat.change}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">vs last month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Search and Filters */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <TableCellsIcon className="w-4 h-4 mr-1" />
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('tree')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'tree'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <FolderIcon className="w-4 h-4 mr-1" />
                      Tree
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                      <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Options */}
              {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        >
                          {statusOptions.map(option => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          </motion.div>
        
        {/* Content Area */}
        <div className="min-h-[600px]">
        {viewMode === 'tree' ? (
          <motion.div
            key="tree"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchCategories}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <CategoryTreeView
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onViewCategory={handleViewCategory}
                onToggleCategory={handleToggleCategory}
                expandedCategories={expandedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            )}
          </motion.div>
        ) : viewMode === 'cards' ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105 h-[320px] flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl flex-shrink-0">
                    {category.image}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700">{category.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1">{category.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{category.productCount} products</span>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${category.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                        {category.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-auto">
                        <button className="group/action relative overflow-hidden flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105 flex items-center justify-center">
                          <EyeIcon className="w-4 h-4 mr-1" /> View
                        </button>
                        <button className="group/action relative overflow-hidden flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105 flex items-center justify-center">
                           <PencilIcon className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDeleteMockCategory(category.id)} className="group/action relative overflow-hidden p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                           <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product Count</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                    {filteredCategories.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-purple-50/50 transition-colors duration-200 group/row"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                              {category.image}
                            </div>
                            <div className="text-sm font-bold text-gray-900">{category.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{category.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {category.productCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${category.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                            {category.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteMockCategory(category.id)} className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
} 