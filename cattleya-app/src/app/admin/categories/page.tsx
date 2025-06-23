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
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import CategoryTreeView from '@/shared/components/CategoryTreeView';
import CategoryForm from '@/shared/components/CategoryForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { categoriesApi, Category } from '@/core/infrastructure/api/categories.api';

// SVG Icons for categories
const categoryIcons = {
  default: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  ),
  orchid: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  care: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  fertilizer: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  pot: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  decorative: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
};

const statusOptions = ['All Status', 'active', 'inactive'];

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'tree'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Tree view state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // Fetch categories from API on initial load and when refresh is triggered
  useEffect(() => {
    const fetchAndRefresh = async () => {
      await fetchCategories();
      const refreshParam = searchParams.get('refresh');
      if (refreshParam === 'true') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('refresh');
        window.history.replaceState({}, '', newUrl.toString());
      }
    };

    fetchAndRefresh();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const categories = await categoriesApi.getAllCategories(true);
      setCategories(Array.isArray(categories) ? categories : []);
      
      // Auto-expand the first category if it has children
      if (categories.length > 0 && categories[0].children && categories[0].children.length > 0) {
        setExpandedCategories(new Set([categories[0].id]));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please check if you are logged in and try again.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function that can be called after adding a category
  const refreshCategories = () => {
    fetchCategories();
  };

  // Listen for route changes to refresh categories when returning from add page
  useEffect(() => {
    const handleRouteChange = () => {
      // Refresh categories when the page becomes visible again
      if (document.visibilityState === 'visible') {
        fetchCategories();
      }
    };

    document.addEventListener('visibilitychange', handleRouteChange);
    return () => document.removeEventListener('visibilitychange', handleRouteChange);
  }, []);

  const handleAddCategory = (parentId?: string) => {
    const path = parentId ? `/admin/categories/add?parentId=${parentId}` : '/admin/categories/add';
    router.push(path);
  };

  const handleEditCategory = (category: Category) => {
    router.push(`/admin/categories/${category.id}/edit`);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(category.id);
      const result = await categoriesApi.deleteCategory(category.id);
      
      if (result.success) {
        // Refresh the categories list
        await fetchCategories();
      } else {
        alert('Failed to delete category. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('An error occurred while deleting the category.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewCategory = (category: Category) => {
    // Navigate to category detail page or show in modal
    console.log('View category:', category);
    // You can implement a modal or navigate to a detail page
    alert(`Viewing category: ${category.name}\nProducts: ${category.productCount}\nStatus: ${category.isActive ? 'Active' : 'Inactive'}`);
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

  // Get icon for category based on name or use default
  const getCategoryIcon = (category: Category) => {
    const name = category.name.toLowerCase();
    if (name.includes('orchid')) return categoryIcons.orchid;
    if (name.includes('care') || name.includes('accessory')) return categoryIcons.care;
    if (name.includes('fertilizer') || name.includes('nutrient')) return categoryIcons.fertilizer;
    if (name.includes('pot') || name.includes('supply')) return categoryIcons.pot;
    if (name.includes('decorative') || name.includes('style')) return categoryIcons.decorative;
    return categoryIcons.default;
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All Status' || 
                         (selectedStatus === 'active' && category.isActive) ||
                         (selectedStatus === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Categories', href: '/admin/categories' }
  ];

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
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
      name: 'Archived',
      value: stats.inactive.toString(),
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
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={refreshCategories}
                    disabled={isLoading}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105 disabled:opacity-50">
                      <ArrowPathIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                      Refresh
                    </div>
                  </motion.button>
                  <button 
                    onClick={() => handleAddCategory()}
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
                onViewCategory={handleViewCategory}
                onToggleCategory={handleToggleCategory}
                expandedCategories={expandedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 justify-center w-full px-2"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group relative w-full max-w-xl mb-8 mx-auto"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105 flex flex-col md:flex-row w-full min-h-[180px] md:min-h-[220px]">
                  <div className="h-32 md:h-full w-full md:w-48 bg-gradient-to-br from-purple-100 to-pink-100 flex-1 flex items-center justify-center text-5xl flex-shrink-0">
                    {category.icon ? (
                      <img
                        src={category.icon}
                        alt={category.name + ' icon'}
                        className="h-24 md:h-32 max-h-full w-auto mx-auto object-contain text-purple-600"
                      />
                    ) : (
                      getCategoryIcon(category)
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700">{category.name}</h3>
                      <p className="text-base text-gray-700 mb-4 whitespace-pre-line break-words" style={{ minHeight: '3.5rem' }}>{category.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{category.productCount} products</span>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${category.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-auto">
                      <button 
                        onClick={() => handleViewCategory(category)}
                        className="group/action relative overflow-hidden flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105 flex items-center justify-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" /> View
                      </button>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="group/action relative overflow-hidden flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105 flex items-center justify-center"
                      >
                         <PencilIcon className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
                        disabled={isDeleting === category.id}
                        className="group/action relative overflow-hidden p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isDeleting === category.id ? (
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         ) : (
                           <TrashIcon className="w-4 h-4" />
                         )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
} 